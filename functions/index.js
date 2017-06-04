const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp(functions.config().firebase);

const app = express();

const verifyPermissions = (type) => (req, res, next) => {
  const { topicId } = req.params;
  admin.database().ref(`/topics/${topicId}/permissions`)
  .once('value', (data) => {
    if (!data.exists() || data.val()[type] === 'all') {
      next();
    } else {
      res.status(403).send();
    }
  });
}

app.get('/:topicId',
  verifyPermissions('read'),
  (req, res) => {
    const { topicId } = req.params;
    admin.database().ref(`/msgs/${topicId}`)
    .once('value', (data) => {
      res.send(data.val());
    });
  }
);

app.post('/:topicId', 
  verifyPermissions('write'),
  (req, res) => {
    const { topicId } = req.params;
    admin.database().ref(`/msgs/${topicId}`).push({
      text: req.body.text,
    })
    .then(result => {
      res.send('ok');
    });
  }
);

exports.api = functions.https.onRequest(app);
