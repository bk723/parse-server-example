// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

const resolve = require('path').resolve;

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  appName: 'TRACK',
  publicServerURL: process.env.SERVER_URL,
  emailAdapter: {
    module: 'parse-server-mailgun',
    options: {
        // The address that your emails come from
        fromAddress: 'TRACK <no-reply@ddr-track.com>',
        // Your domain from mailgun.com
        domain: process.env.MAILGUN_DOMAIN || '',
        // Your API key from mailgun.com
        apiKey: process.env.MAILGUN_API_KEY || '',
                          /*
                          templates: {
                          passwordResetEmail: {
                          subject: 'Reset your password',
                          pathPlainText: resolve(__dirname, './templates/password_reset_email.txt'),
                          pathHtml: resolve(__dirname, './templates/password_reset_email.html'),
                          callback: (user) => { return { firstName: user.get('firstName') }}
                          // Now you can use {{firstName}} in your templates
                          },
                          verificationEmail: {
                          subject: 'Confirm your account',
                          pathPlainText: resolve(__dirname, './templates/verification_email.txt'),
                          pathHtml: resolve(__dirname, './templates/verification_email.html'),
                          callback: (user) => { return { firstName: user.get('firstName') }}
                          // Now you can use {{firstName}} in your templates
                          },
                          customEmailAlert: {
                          subject: 'Urgent notification!',
                          pathPlainText: resolve(__dirname, './templates/custom_alert.txt'),
                          pathHtml: resolve(__dirname, './templates/custom_alert.html'),
                          }
                          }
                          */
        // The template section
        templates: {
            passwordResetEmail: {
                subject: 'TRACK 비밀번호 재설정',
                pathPlainText: resolve(__dirname, './templates/password_reset_email.txt'),
//                pathHtml: resolve(__dirname, './templates/password_reset_email.html'),
                callback: (user) => { return { nickname: user.get('nickname') }}
                // Now you can use {{firstName}} in your templates
            },
            verificationEmail: {
                subject: 'TRACK 이메일 계정 확인',
                pathPlainText: resolve(__dirname, './templates/verification_email.txt'),
                pathHtml: resolve(__dirname, './templates/verification_email.html'),
                callback: (user) => { return { nickname: user.get('nickname') }}
                // Now you can use {{firstName}} in your templates
            },
            customEmailAlert: {
                subject: 'Urgent notification!',
                pathPlainText: resolve(__dirname, './templates/custom_alert.txt'),
                pathHtml: resolve(__dirname, './templates/custom_alert.html')
            }
        }
    }
  }
                          
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
