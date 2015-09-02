// Level projects are improvements that affect the whole level but are built in the camp
define(['ash', 'game/vos/ImprovementVO'], function (Ash, ImprovementVO) {
    
    var LevelProjectVO = Ash.Class.extend({
	
        constructor: function (improvement, action, sector, name) {
			this.sector = sector;
			this.improvement = improvement;
			this.action = action;
			this.name = name;
			if (!this.name) {
				this.name = this.improvement.name;
			}
		},
	
    });

    return LevelProjectVO;
});