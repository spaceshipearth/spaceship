import { Color } from './../shared/theme';
import { EmailIcon, FacebookIcon, TwitterIcon } from 'react-share';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ShareIcon from '@material-ui/icons/Share';
import { Box, Button, Typography, TextField, IconButton } from '@material-ui/core';
import Input from '@material-ui/core/Input';

export function SocialShareButtons({
  user,
  forEmail,
  optTrade,
  size,
  justifyContent,
  textButtons,
  twitterHandleInsteadOfName,
  shareMessage,
  sharingUrl,
}) {
  const [shouldRender, setShouldRender] = React.useState(false);
  React.useEffect(() => {
    setShouldRender(true);
  });

  if (!shouldRender && !forEmail) {
    // Don't render SSR because we have diff. renderings based on mobile vs. desktop.
    return null;
  }

  const emojilessShareMessage = shareMessage
    ? shareMessage.replace(
        /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
      )
    : "";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: justifyContent || "space-around",
        cursor: "pointer"
      }}
    >
      <SocialShareButton
        network="facebook"
        size={size}
        shareMessage={emojilessShareMessage}
        url={sharingUrl + "?via=fb"}
        label={textButtons ? "Share" : ""}
        backgroundColor="#3b5998"
        textColor="#FFFFFF"
        forEmail={forEmail}
        icon={FacebookIcon}
      />
      {forEmail ? (
        ""
      ) : (
        <SocialShareButton
          network="email"
          size={size}
          shareMessage={shareMessage}
          label={textButtons ? "Email" : ""}
          url={sharingUrl + "?via=em"}
          backgroundColor={Color.GOLD}
          textColor="#ffffff"
          icon={EmailIcon}
        />
      )}
      <SocialShareButton
        network="twitter"
        size={size}
        shareMessage={shareMessage}
        url={sharingUrl + "?via=tw"}
        label={textButtons ? "Tweet" : ""}
        backgroundColor="#1da1f2"
        textColor="#FFFFFF"
        forEmail={forEmail}
        icon={TwitterIcon}
      />
    </div>
  );
}

const getScreenCenterTopLeft = (width, height) => ({
  top: (window.screen.height - height) / 2,
  left: (window.screen.width - width) / 2,
});

const WINDOW_CONFIG = {
  height: 400,
  width: 550,
  location: 'no',
  toolbar: 'no',
  status: 'no',
  directories: 'no',
  menubar: 'no',
  scrollbars: 'yes',
  resizable: 'no',
  centerscreen: 'yes',
  chrome: 'yes',
};

function SocialShareButton({ network, size, label, backgroundColor, textColor, icon, url, shareMessage, forEmail }) {
  const isNativeShare = false; // TODO(mime): disabled for now. network == 'email' && isMobile() && navigator.share !== undefined;
  if (isNativeShare) {
    icon = ShareIcon;
  }

  const Icon = icon;
  size = size || 30;

  let shareUrl;
  if (network == 'twitter') {
    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
  } else if (network == 'facebook') {
    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(
      shareMessage
    )}`;
  } else if (network == 'email') {
    shareUrl = `mailto:?subject=${encodeURIComponent('Check this out')}&body=${encodeURIComponent(shareMessage)}`;
  }

  function handleClick() {
    if (isNativeShare) {
      navigator.share({
        title: shareMessage,
        url,
      });
      return;
    }

    if (network == 'email') {
      windowConfig = { noopener: 'yes' };
    }
    let windowConfig = Object.assign(
      {},
      WINDOW_CONFIG,
      getScreenCenterTopLeft(WINDOW_CONFIG.width, WINDOW_CONFIG.height)
    );
    window.open(
      shareUrl,
      '_blank',
      Object.keys(windowConfig)
        .map(key => `${key}=${windowConfig[key]}`)
        .join(',')
    );
  }

  let labelButtonStyle = {
    backgroundColor: backgroundColor,
    color: textColor,
    borderRadius: size / 2,
    height: size,
  };

  if (forEmail) {
    labelButtonStyle = Object.assign(labelButtonStyle, {
      fontSize: 12,
      textDecoration: 'none',
      width: 100,
      marginLeft: 10,
    });
    return (
      <a href={shareUrl} style={labelButtonStyle} title={label}>
        <img
          src={CDN(`/static/img/${network}.png?v=1`)}
          style={{ float: 'left', paddingLeft: 5, width: 30, height: 30 }}
        />
        <span style={{ lineHeight: '30px', marginLeft: -20 }}>{label}</span>
      </a>
    );
  }
  const iconStyle = isNativeShare
    ? { fill: '#fff', backgroundColor: Color.GOLD, padding: '4px', borderRadius: '16px' }
    : null;
  return label ? (
    <Button style={labelButtonStyle} onClick={handleClick} title={label}>
      <span style={{ top: 0, left: 2, position: 'absolute' }}>
        <Icon
          round
          size={size}
          logoFillColor={'white'}
          iconBgStyle={{ fill: backgroundColor, borderRadius: size / 2 }}
          style={iconStyle}
        />
      </span>
      <Typography variant="button" style={{ paddingLeft: 25, paddingRight: 10 }}>
        {label}
      </Typography>
    </Button>
  ) : (
    <IconButton onClick={handleClick} size="small" title={network}>
      <Icon round size={size} logoFillColor={'white'} iconBgStyle={{ fill: backgroundColor }} style={iconStyle} />
    </IconButton>
  );
}

export function SharePrompt({ shareMessage, shareUrl, user }) {
  const [customShareMessage, setCustomShareMessage] = React.useState(shareMessage);
  const [focused, setFocused] = React.useState(false);

  return (
    <>
      <h4 style={{ marginBottom: 16, marginTop: 10 }}>Share with your friends </h4>
      <Input
        id="sharing-message"
        multiline
        rows={6}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => setCustomShareMessage(e.target.value)}
        style={{
          fontSize: 14,
          width: '100%',
          borderRadius: 5,
          border: focused ? '1px solid #5C29D4' : '1px solid #ccc',
          padding: 8,
          lineHeight: 1.5,
          backgroundColor: 'white',
        }}
        disableUnderline={true}
        value={customShareMessage}
      />
      <Box style={{ marginTop: 10, marginBottom: 10 }}>
        <SocialShareButtons
          user={user}
          alwaysColorful={true}
          textButtons={true}
          twitterHandleInsteadOfName={true}
          customShareMessage={customShareMessage}
          customSharingUrl={shareUrl}
        />
      </Box>
    </>
  );
}
