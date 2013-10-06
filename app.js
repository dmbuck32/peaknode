var express   = require('express')
  , memStore  = new express.session.MemoryStore()
  , config    = require('./config.json')
  , http      = require('http')
  , cors      = require('cors')
  , app       = express()

//Configure our application environment
app.configure(function() {
  app.set('port', config.http_port)
  app.use(express.logger('dev'))
  app.use(express.bodyParser({ uploadDir:__dirname + '/tmp' }))
  app.use(express.cookieParser('wvu-peak-api'))
  app.use(express.session({
    store:memStore,
    secret:'7]fo+>+yR-&}}|!Kh>kC6Vbl:Krb)TrG&Ibkcu~AcRV/t[$+H+:_xb#a4G20MK>a',
    cookie:{maxAge:365 * 24 * 60 * 60 * 1000}
  }))
  app.use(express.methodOverride())
  app.use(cors())
  app.use(app.router)
})

app.configure('development', function(){
  app.use(express.errorHandler())
})

var db    = require('./lib/database')
  , omni  = require('./lib/omnilink')
  , fit   = require('./lib/fitbit')(config.fitbit_key, config.fitbit_secret)
  , xbmc  = require('./lib/xbmc')(config)

//Configure API Handlers
//Pass MySQL connection via SequelizeJS
require('./routes')(app, memStore, db, omni, fit, xbmc)

//Begin listening to port specified in 'config.http_port'
http.createServer(app).listen(app.get('port'), function(){
  console.log("WVUPeak API running at localhost:" + app.get('port'))
})

//Export app
module.exports = app