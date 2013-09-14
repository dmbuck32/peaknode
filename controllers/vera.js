function VeraAPI(db, host)
{
  var http = require('http')
  
  function queryStr(params){
    var str = []
    for(p in params) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]))
    return str.join("&")
  }
  function reqVera(params, res, callback){
    var url = 'http://'+host+'/data_request?'+queryStr(params)
    console.log('VERA -> ', url)
    var req = http.get(url, function(vera) {
      vera.setEncoding('utf8')
      vera.on('data', function(data){
        try{ callback(JSON.parse(''+data+'')) }catch(SyntaxError){ res.status(201).json({ error:'Target failed to respond', data:data }) }
      })
      vera.on('timeout', function(){
        console.log('timeout')
        vera.abort()
      })
    }).on('error', function(e) {
      res.status(201).json({ error:e.message })
    })
    setTimeout(function(){ req.emit('timeout') })
  }
  
  this.available = function(req, res){
    reqVera({}, res, function(data){
      res.json(data)
    })
  }
  
  this.request = function(req, res){
    reqVera(req.query, res, function(data){
      res.send(data)
    })
  }
  
  this.list = function(req, res) {
    reqVera({ id:'sdata' }, res, function(data){
      res.json(data.devices)
    })
  }
  
  this.show = function(req, res){
    reqVera({ id:'status', DeviceNum:req.params.id }, res, function(data){
      res.json(data)
    })
  }
  
  //switch power, lock
  this.state = function(req, res){
    var state   = req.body.state
      , type    = req.body.type
    if(type == 'switch') type = 'urn:upnp-org:serviceId:SwitchPower1'
    else if(type == 'lock') type = 'urn:micasaverde-com:serviceId:DoorLock1'
    else return res.status(401).json({ error:'Invalid type' })
    
    if(state == 'on' || state == 'off')
      reqVera({
        id:'action',
        DeviceNum:req.params.id,
        serviceId:type,
        action:'SetTarget',
        newTargetValue:state == 'on'? 1:0
      }, res, function(data){
        res.json(data)
      })
    else res.status(401).json({ error:'Invalid state' })
  }
  
  //read power
  this.power = function(req, res){
    reqVera({
      id:'variableget',
      DeviceNum:req.params.id,
      serviceId:'urn:micasaverde-com:serviceId:EnergyMetering1',
      Variable:'Watts'
    })
  }
}
module.exports = function(d, h){ return new VeraAPI(d, h) }