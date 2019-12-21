import { Identity, User, Sequelize } from './db/models';

import Twitter from 'twitter';
import express from 'express';
import fetch from 'node-fetch';
import fbgraphWithCallbacks from 'fbgraph';
import grant from 'grant-express';
import util from 'util';

const router = express.Router();

// this shouldn't be needed because server.js already configures dotenv
// something about razzle webpack import order isn't quite what you'd expect
import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });


const GOOGLE_CONTACTS_RO_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly';
const grantConfig = {
  defaults: {
    host: process.env.GRANT_HOST,
    protocol: process.env.GRANT_PROTOCOL,
    transport: 'session',
    path: '/auth',
    state: true,
  },
  google: {
    key: process.env.GOOGLE_KEY,
    secret: process.env.GOOGLE_SECRET,
    //    scope: ['email', 'profile', GOOGLE_CONTACTS_RO_SCOPE],
    scope: ['email', 'profile'],
    nonce: true,
    custom_params: { access_type: 'offline' },
    callback: '/auth/google-authed',
  },
  facebook: {
    key: process.env.FACEBOOK_KEY,
    secret: process.env.FACEBOOK_SECRET,
    scope: ['public_profile', 'email'],
    callback: '/auth/facebook-authed',
  },
  twitter: {
    key: process.env.TWITTER_KEY,
    secret: process.env.TWITTER_SECRET,
    callback: '/auth/twitter-authed',
  },
};

async function contMiddleware(req, res, next) {
  if (req.query.cont) {
    req.session.cont = req.query.cont;
  }
  next();
}

router.use(contMiddleware);
router.use(grant(grantConfig));

// promisify fb lib
const fb = {};
['setAccessToken', 'get'].forEach(method => {
  fb[method] = util.promisify(fbgraphWithCallbacks[method]);
});

export const Service = {
  FACEBOOK: 0,
  TWITTER: 1,
  GOOGLE: 2,
  NATIVE: 3,
};

function signIn(req, res, user, cont) {
  req.session.currentUserId = user.id;
  cont = cont || req.session.cont;
  if (cont) {
    return res.redirect(`${cont}`);
  }
  return res.redirect('/');
}

router.get('/signin', async (req, res) => {
  if (req.query.token && req.query.email && req.query.token.length == 10) {
    const user = await User.findOne({ where: { email: req.query.email, password: req.query.token } });
    if (user) {
      // user.password = null;
      // await user.save();
      return signIn(req, res, user, req.query.cont);
    }
  }
  res.send('Oops, this sign-in link has expired!');
});

async function loadGoogleUserInfo(identity, ensureFreshAccessToken) {
  // Use the access token to read the profile information
  if (ensureFreshAccessToken) {
    await refreshGoogleAccessToken(identity);
  }

  var bearer = 'Bearer ' + identity.accessToken;
  const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
  const response = await fetch(url, { method: 'GET', headers: { Authorization: bearer } });
  return response.json();
}

async function refreshGoogleAccessToken(identity) {
  const tokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
  const params = {
    client_id: grantConfig.google.key,
    client_secret: grantConfig.google.secret,
    refresh_token: identity.refreshToken,
    grant_type: 'refresh_token',
  };
  const urlEncodedBody = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: urlEncodedBody,
  });
  identity.accessToken = (await response.json()).access_token;
  await identity.save();
}

router.get('/google-authed', async (req, res) => {
  // Extract access token from grant session
  const accessToken = req.session.grant.response.access_token;
  const refreshToken = req.session.grant.response.refresh_token;
  const scope = req.session.grant.response.raw.scope;
  delete req.session.grant;

  const authedIdentity = Identity.build({
    accessToken,
    refreshToken,
    serviceId: Service.GOOGLE,
    scope: scope,
  });

  const userInfo = await loadGoogleUserInfo(authedIdentity);
  authedIdentity.identifier = userInfo.id;

  return handleAuthed(req, res, authedIdentity, {
    name: userInfo.name,
    email: userInfo.email,
    photoUrl: userInfo.picture,
  });
});

router.get('/facebook-authed', async (req, res) => {
  console.log({ session: req.session, response: req.session.grant.response }, { path: '/auth/facebook-authed' });

  // Extract access token from grant session
  const accessToken = req.session.grant.response.access_token;
  delete req.session.grant;

  // Use the access token to read the profile information
  fb.setAccessToken(accessToken);
  let userInfo = await fb.get('me', { fields: 'name, email, picture' });

  // fb photos have data.height = 50
  const photoUrl = userInfo.picture.data.url;
  return handleAuthed(
    req,
    res,
    Identity.build({
      identifier: userInfo.id,
      accessToken,
      // no refreshToken
      serviceId: Service.FACEBOOK,
      scope: grantConfig.facebook.scope.join(' '),
    }),
    { photoUrl, email: userInfo.email, name: userInfo.name }
  );
});

router.get('/twitter-authed', async (req, res) => {
  const accessToken = req.session.grant.response.access_token;
  const accessSecret = req.session.grant.response.access_secret;
  const identifier = req.session.grant.response.raw.user_id;

  delete req.session.grant;

  var twitterClient = new Twitter({
    consumer_key: grantConfig.twitter.key,
    consumer_secret: grantConfig.twitter.secret,
    access_token_key: accessToken,
    access_token_secret: accessSecret,
  });

  const userInfo = await twitterClient.get('account/verify_credentials', { include_email: true });
  const name = userInfo.name;
  const email = userInfo.email;
  const photoUrl = userInfo.profile_image_url_https; // 48x48
  const twitterHandle = '@' + userInfo.screen_name;
  return handleAuthed(
    req,
    res,
    Identity.build({
      identifier,
      accessToken,
      refreshToken: accessSecret, // OAuth1
      serviceId: Service.TWITTER,
      scope: grantConfig.facebook.scope.join(' '),
    }),
    { name, email, photoUrl, twitterHandle }
  );
});

// persist twitter and user photo handle
async function updateUserInfo(user, { photoUrl }) {
  if (photoUrl) {
    user.photoUrl = photoUrl;
  }
  return user.save();
}

export async function createUser({ name, photoUrl, email }) {
  return await User.create({
    name,
    photoUrl, // may be null
    email,
  });
}

async function handleAuthed(
  req,
  res,
  authedIdentity,
  { photoUrl, twitterHandle, email, name } // User
) {

  // Update any existing identity credentials
  const existingIdentity = await Identity.findOne({
    where: { identifier: authedIdentity.identifier, serviceId: authedIdentity.serviceId },
  });
  if (existingIdentity) {
    existingIdentity.accessToken = authedIdentity.accessToken;
    existingIdentity.refreshToken = authedIdentity.refreshToken;
    await existingIdentity.save();
  }

  // Autogenerate an email for cases where we're not given one
  if (!email) {
    email = `${authedIdentity.identifier}@${authedIdentity.serviceId}.example.com`;
  }

  if (res.locals.currentUser) {
    // Additional account linking flow
    if (existingIdentity) {
      if (existingIdentity.userId != res.locals.currentUser.id) {
        console.log('Account already connected to another user.');
        req.session.error = {
          timestamp: new Date().getTime(),
          message: 'This social account is already connected to another user.',
        };
        return res.redirect('/');
      } else {
        console.log('Account already connected - nothing to do.');
        await updateFriendsAsync(existingIdentity);
      }
    } else {
      // Link this new identity with the current account
      // TODO: Some further confirmation step
      authedIdentity.userId = res.locals.currentUser.id;
      await authedIdentity.save();
      await updateUserInfo(res.locals.currentUser, { twitterHandle, photoUrl, name, email });
    //  await updateFriendsAsync(authedIdentity);
    }

    return res.redirect('/');
  } else {
    // Sign-in, sign-up, or auto-link based on email flow

    let user;
    if (existingIdentity) {
      // Sign-in flow
      user = await User.findByPk(existingIdentity.userId); // TODO: non-deleted
      await updateUserInfo(user, { photoUrl, name, email });
      //await updateFriendsAsync(existingIdentity);
    } else {
      // Sign-up (or auto-link to account with matching email)
      user = await User.findOne({ where: { email } }); // TODO: non-deleted
      if (!user) {
        user = await createUser({
          name,
          photoUrl, // may be null
          email,
        });
      } else {
        await updateUserInfo(user, { photoUrl, name, email });
      }

      // Associate authed identity with the user
      authedIdentity.userId = user.id;
      await authedIdentity.save();
      // await updateFriendsAsync(authedIdentity);
    }

    const cont = req.session.cont;
    return signIn(req, res, user, cont);
  }
}

/*async function updateFriendsAsync(identity) {
  if (identity.serviceId == Service.TWITTER) {
    return updateTwitterFriends(identity);
  } else if (identity.serviceId == Service.FACEBOOK) {
    return updateFacebookFriends(identity);
  } else if (identity.serviceId == Service.GOOGLE) {
    return updateGoogleFriends(identity);
  }
}

export async function upsertFriendships(friendshipRows) {
  return Friendship.bulkCreate(friendshipRows, {
    fields: ['identityId', 'targetIdentifier'],
    updateOnDuplicate: ['updatedAt'],
  });
}

async function updateFacebookFriends(identity) {
  // Load facebook friend ids (we only get ones that are already app users)
  fb.setAccessToken(identity.accessToken);
  const friendInfos = await fb.get('me/friends');
  console.log({ method: 'updateFacebookFriends', friendCount: friendInfos.data.length });
  const targetIdentifiers = friendInfos.data.map(fi => fi.id);

  // Insert forward links
  await upsertFriendships(
    targetIdentifiers.map(ti => ({
      identityId: identity.id,
      targetIdentifier: ti,
    }))
  );

  // Insert back-links (to ensure friends who joined before us see us)
  const friendIdentities = await Identity.findAll({ where: { identifier: targetIdentifiers } });

  await upsertFriendships(
    friendIdentities.map(fi => ({
      identityId: fi.id,
      targetIdentifier: identity.identifier,
    }))
  );
}

async function updateGoogleFriends(identity) {
  if (!(identity.scope && identity.scope.indexOf(GOOGLE_CONTACTS_RO_SCOPE) > -1)) {
    // don't have the scope
    return;
  }

  var bearer = 'Bearer ' + identity.accessToken;
  const url =
    'https://people.googleapis.com/v1/people/me/connections?pageSize=2000&personFields=emailAddresses&sortOrder=LAST_MODIFIED_DESCENDING';
  const response = await fetch(url, { method: 'GET', headers: { Authorization: bearer } });
  const responseJson = await response.json();
  const allEmailsHash = responseJson.connections
    .filter(contact => contact.emailAddresses)
    .reduce((allEmails, contact) => {
      contact.emailAddresses.forEach(email => {
        allEmails[email.value] = 1;
      });
      return allEmails;
    }, {});
  const allFriendEmails = Object.keys(allEmailsHash);
  await upsertFriendships(
    allFriendEmails.map(email => ({
      identityId: identity.id,
      targetIdentifier: email,
    }))
  );
}
*/

export async function refreshSocialPhotos() {
  const users = await User.findAll({ where: { photoUrl: { [Sequelize.Op.ne]: null } } });
  console.log({ event: 'RefreshingPhotos', users: users.length });
  let photosUpdated = 0;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const response = await fetch(user.photoUrl);
    if (response.status > 400) {
      console.log({ event: 'PhotoNotFound', email: user.email });
      const identities = await Identity.findAll({ where: { userId: user.id }, order: [['updatedAt', 'DESC']] });
      for (let j = 0; j < identities.length; j++) {
        const identity = identities[j];
        try {
          if (identity.serviceId == Service.TWITTER) {
            var twitterClient = new Twitter({
              consumer_key: grantConfig.twitter.key,
              consumer_secret: grantConfig.twitter.secret,
              access_token_key: identity.accessToken,
              access_token_secret: identity.accessSecret,
            });
            const userInfo = await twitterClient.get('account/verify_credentials', { include_email: true });
            user.photoUrl = userInfo.profile_image_url_https;
          } else if (identity.serviceId == Service.FACEBOOK) {
            // Use the access token to read the profile information
            fb.setAccessToken(identity.accessToken);
            const userInfo = await fb.get('me', {
              fields: 'name, email, picture',
            });
            user.photoUrl = userInfo.picture.data.url;
          } else if (identity.serviceId == Service.GOOGLE) {
            const googleUserInfo = await loadGoogleUserInfo(identity, true /*ensureFreshAccessToken*/);
            users[i].photoUrl = googleUserInfo.picture;
          }
          console.log({
            event: 'PhotoUpdated',
            photo: user.photoUrl,
            email: user.email,
            serviceId: identity.serviceId,
          });
          photosUpdated = photosUpdated + 1;
          await user.save();
          break; // don't look at more identities
        } catch (ex) {
          console.log({ event: 'AccessTokenExpired' }, identity);
          console.error(ex);
        }
      }
    }
  }
  console.log({ event: 'PhotoUpdateCompleted', photosUpdated });
}

/*async function updateTwitterFriends(identity) {
  const twitterClient = new Twitter({
    consumer_key: grantConfig.twitter.key,
    consumer_secret: grantConfig.twitter.secret,
    access_token_key: identity.accessToken,
    access_token_secret: identity.refreshToken,
  });

  // TODO: handle paging (we only get 5k friends per page)
  let friendInfos;
  friendInfos = await twitterClient.get('friends/ids', { user_id: identity.identifier, stringify_ids: true });
  console.log({ method: 'updateTwitterFriends', friendCount: friendInfos.ids.length });

  let cursor = '-1';
  let friendshipRows = [];
  while (cursor !== '0') {
    const friendsInfos = await twitterClient.get('friends/ids', {
      user_id: identity.userId,
      stringify_ids: true,
      cursor,
    });
    friendshipRows = friendshipRows.concat(
      friendsInfos.ids.map(id => ({
        identityId: identity.id,
        targetIdentifier: id,
      }))
    );
    cursor = friendsInfos.next_cursor_str;
  }

  await upsertFriendships(friendshipRows);
}*/

export default router;
