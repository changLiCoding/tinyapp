const urlDatabase = require('../database/urldatabase');

const randomIDGenerate = (numberOfChar) => {
  const template = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const results = [];
  for (let i = 0; i < numberOfChar; i++) {
    const randomIndex = Math.round(Math.random() * 62);
    results.push(template[randomIndex]);
  }
  return results.join('');
};

const findUserByEmail = (email, db) => {
  for (let id in db) {
    if (db[id].email === email) {
      return db[id];
    }
  }
  return null;
};
//Find relevant URLs with their owner, by owner's ID
const findURLByUserId = (id, db) => {
  const res = {};
  for (let idOfURL in db) {
    if (db[idOfURL].userID === id) {
      res[idOfURL] = db[idOfURL];
    }
  }
  return res;
};

const getUserVisitById = (userId, urlId) => {
  let isFound = false;
  urlDatabase[urlId].visitedUser.forEach(visitor => {
    if (visitor['userId'] === userId) {
      visitor.count++;
      const timeNow = new Date().toISOString();
      visitor.timeStamps.push(timeNow);
      isFound = true;
    }
  });
  if (isFound === false) {
    urlDatabase[urlId].visitedUser.push({userId, count: 1, timeStamps: [new Date().toISOString()]});
  }
};

module.exports = {randomIDGenerate, findURLByUserId, findUserByEmail, getUserVisitById
};
