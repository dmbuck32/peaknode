function LightAPI(db, omni)
{
  this.list = function(req, res){
    db.zone.all({ order:'id ASC', include:[db.light] }).success(function(zones){
      var lights = []
      zones.forEach(function(z){
        lights.push({
          id:z.id,
          name:z.name,
          lights:(z.lights == undefined)? [] : db.light.parse(z.lights)
        })
      })
      res.json(lights)
    })
  }

  this.show = function(req, res){
    var e = { error:'Invalid light' }, hist = [];
    db.light.find(req.params.id).success(function(light){
      if(light == undefined) return res.status(401).json(e);
      db.light_archive.findAll({ where:{lightId:light.id}, limit:50, order:'id DESC' }).success(function(archives){
        archives.forEach(function(a){ hist.push(a.parse()) })
        res.json({ name:light.name, unit:light.unit, level:light.level, on:light.on, active:light.active, archives:hist })
      })
    }).error(function(err){
      res.status(401).json(e)
    })
  }

  this.state = function(req, res){
    var toggle  = req.body.toggle
      , level   = req.body.level
      , id      = req.body.id
    
    db.light.find(id).success(function(light){
      if(light == undefined) return res.status(401).json({ error:'Invalid light' });
      if(toggle)
      {
        omni.light('control', { unit:light.unit, state:light.on? 0:1 })
        light.updateAttributes({ on:!light.on, level:light.on? light.defaultLevel:0 })
      }
      else if(level >= 0  && level <= 100)
      {
        omni.light('level', { unit:light.unit, level:parseInt(level, 10) })
        light.updateAttributes({ on:level > 0? true:false, level:parseInt(level, 10)})
      }
      else
        res.json({ error:'Expected parameters: state (on/off) or level (0-100)' })
    
      // db.light_archive.create({ state:light.on, level:light.level, lightId:light.id }).success(function(archive){
        res.send()
      // })
    })
  }
  //TODO implement this for bright/dimming functions
  // this.timeout = function(req, res){
  //   var level   = req.body.level
  //     , time    = req.body.time
  //     , id      = req.params.id
  //     , action  = req.params.action;
  // 
  //   db.light.update(id, res, function(light){
  //     if(level >= 0  && level <= 100 && time >= 2 && time <= 99)
  //       if(action == 'dim' || action == 'brighten')
  //         light.step(client, action, level, time);
  //       else
  //         res.status(401).json({ error:'Expected API call: /api/lights/:id/(dim/brighten)' })
  //     else
  //       res.status(401).json({ error:'Expected parameters: time (2-99) and level (0-100)' })
  //   })
  // }
}
module.exports = function(d, c){ return new LightAPI(d, c) }