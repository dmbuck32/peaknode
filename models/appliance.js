module.exports = function(sequelize, DataTypes) {
  var dt = require('../lib/datetime')
  return sequelize.define('appliance', {
    leftOn: { type:DataTypes.BOOLEAN, defaultValue:false },
    rightOn: { type:DataTypes.BOOLEAN, defaultValue:false },
    name: DataTypes.STRING,
    left: DataTypes.INTEGER,
    right: DataTypes.INTEGER,
    power: DataTypes.INTEGER,
    watts: { type:DataTypes.INTEGER, defaultValue:0 },
    kwh: { type:DataTypes.FLOAT, defaultValue:0.0 }
  }, {
    freezeTableName: true,
    instanceMethods:{
      parse:function(){
        return { id:this.id, left:this.left, right:this.right, leftOn:this.leftOn, rightOn:this.rightOn, power:this.power, watts:this.watts, kwh:this.kwh, name:this.name, timestamp:dt.dateTimeFormat(this.updatedAt) }
      }
    },
    classMethods:{
      parse:function(apps){
        var list = []
        if(apps != undefined) apps.forEach(function(a){ list.push(a.parse()) })
        return list
      }
    }
  })
}
