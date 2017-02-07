var auth = require('./auth.js');

var GoogleTokenProvider = require('refresh-token').GoogleTokenProvider;
 
var tokenProvider = new GoogleTokenProvider({
  refresh_token: process.env.REFTOK || auth.googleRefreshToken,
  client_id:     process.env.CLID || auth.client_id, 
  client_secret: process.env.CLSEC || auth.client_secret
});

module.exports = {
  refreshTokenPromise: function() {
    return new Promise(function(resolve, reject) {
      tokenProvider.getToken(function (err, token) {
        if(err) {
          reject(err);
        }
        resolve(token);
      });
    });
  } 
};

 // tokenProvider.getToken(function (err, token) {
 //        if(err) {
 //          console.log(err && err.stack);
 //        }
 //        console.log(token);
 //      });


