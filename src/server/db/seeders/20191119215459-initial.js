"use strict";

// I'm hardcording the ids of the initial categories and goals. In the future
// we'll use auto-generated ids, but it seems convenient to have some global
// "known ids" for now so that we can run custom code against some of these
// before we figure out what we want this all to look like
const categoriesAndGoals = [
  {
    id: "diet",
    title: "Plant-Rich Diet",
    shortDescription: "Change your diet, change the world",
    longDescription: "Change your diet, change the world",
    goals: [
      {
        id: "vegan",
        title: "Go vegan",
        shortDescription: "Avoid all animal products",
        longDescription: `Our diet comes with a steep climate price tag: one-fifth of global emissions.
        Adopting a vegan diet is the most impactful thing you could do to lower your diet's footprint.
        A vegan diet eliminates 80% of the average Americans diet related emissions. Learn more <br/>
        <a href="https://www.independent.co.uk/life-style/health-and-families/veganism-environmental-impact-planet-reduced-plant-based-diet-humans-study-a8378631.html">Single best way to help fight climate change</a>`
      },
      {
        id: "vegeterian",
        title: "Go vegetarian",
        shortDescription: "Avoid all animal flesh; dairy and eggs are ok",
        longDescription: "Animal products are bad. Don't eat them."
      },
      {
        id: "nobeef",
        title: "Avoid beef",
        shortDescription: "Avoid beef",
        longDescription: "Animal products are bad. Don't eat them."
      }
    ]
  },
  {
    id: "transportation",
    title: "Transportation",
    shortDescription: "Save energy by changing how you travel",
    longDescription: "Save energy by changing how you travel",
    goals: [
      {
        id: "nocar",
        title: "Take public transit or bike everywhere",
        shortDescription: "Take public transit or bike",
        longDescription:
          "You should be biking more. Good for you and good for the planet."
      },
      {
        id: "bikecommute",
        title: "Bike to work/school",
        shortDescription: "Ride your bike to work or school",
        longDescription:
          "You should be biking more. Good for you and good for the planet."
      },
      {
        id: "localvacay",
        title: "Plan a local vacation",
        shortDescription: "Take a roadtrip instead of flying",
        longDescription:
          "You should be biking more. Good for you and good for the planet."
      }
    ]
  },
  {
    id: "community",
    title: "Community",
    shortDescription: "Connect and work with others to grow your impact",
    longDescription: "Connect and work with others to grow your impact",
    goals: [
      {
        id: "direct",
        title: "Organize direct action",
        shortDescription: "Lead the change you wish to see in the world",
        longDescription:
          "Each of us can step up to galvanize our friends and network to take action."
      },
      {
        id: "volunteer",
        title: "Volunteer",
        shortDescription: "Give time to a local non-profit or movement",
        longDescription:
          "Be a visible supporter and take concrete steps to help others."
      },
      {
        id: "donate",
        title: "Donate",
        shortDescription: "Give money to a local non-profit organization",
        longDescription: "Financial contributions make a difference"
      }
    ]
  },
  {
    id: "education",
    title: "Education",
    longDescription:
      "Learn more about the science and policy of climate change",
    goals: [
      {
        id: "meetrep",
        title: "Meet your representatives",
        shortDescription: "Get involved in local government decision-making",
        longDescription:
          "Who are your local representatives and what are their positions on climate change? What proposals or plans have they made relevant to your local community? Find out and get involved by writing letters and attending meetings. This will amplify your impact."
      },
      {
        id: "friendchat",
        title: "Have a conversation",
        shortDescription: "Talk to your friends about climate change",
        longDescription: "Especially if they don't believe in it"
      },
      {
        id: "readbook",
        title: "Read a book",
        shortDescription: "Become educated about climate change",
        longDescription: "This is your chance. You've always wanted to read."
      }
    ]
  },
  {
    id: "resources",
    title: "Resources & Waste",
    shortDescription: "Conserve energy & reuse materials",
    longDescription: "Conserve energy & reuse materials",
    goals: [
      {
        id: "recycle",
        title: "Reduce your trash",
        shortDescription: "Lead the change you wish to see in the world",
        longDescription:
          "Each of us can step up to galvanize our friends and network to take action."
      },
      {
        id: "homeenergy",
        title: "Home energy use",
        shortDescription: "Switch to sustainable energy",
        longDescription:
          "Where is your energy coming from and how much are you using? Evaluate your home energy usage and transition to more renewable sources"
      },
      {
        id: "buylocal",
        title: "Buy local",
        shortDescription: "Shop locally",
        longDescription:
          "Buying items locally supports your local community and reduces emissions from transporting goods."
      }
    ]
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categoryRows = [];
    const goalRows = [];
    const now = new Date();
    categoriesAndGoals.forEach((category, idx) => {
      category.goals.forEach((goal, idx) => {
        // augment with timestamps and displayRank
        goalRows.push({
          ...goal,
          ...{ categoryId: category.id, createdAt: now, updatedAt: now, displayRank: idx }
        });
      });
      delete category["goals"];

      // augment with timestamps and displayRank
      categoryRows.push({
        ...category,
        ...{ createdAt: now, updatedAt: now, displayRank: idx }
      });
    });

    await queryInterface.bulkInsert("Categories", categoryRows);
    await queryInterface.bulkInsert("Goals", goalRows);
  },

  down: async (queryInterface, Sequelize) => {
    // empty the goals and categories dbs
    await queryInterface.bulkDelete("Goals");
    await queryInterface.bulkDelete("Categories");
  }
};
