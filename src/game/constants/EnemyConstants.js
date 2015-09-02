define(['ash', 'game/constants/WorldCreatorConstants', 'game/vos/EnemyVO'],
function (Ash, WorldCreatorConstants, EnemyVO) {

    var EnemyConstants = {
		
		enemyTypes: {
			urban: "urban",		// top 5 levels
			inhabited: "inhabited",	// top 10 levels
			sunlit: "sunlit",		// anywhere with sunlight
			earth: "earth",		// bottom 2 levels
			global: "global",		// any level
		},
		
		enemyDefinitions: {
			urban: [ ],
			inhabited: [ ],
			sunlit: [ ],
			earth: [ ],
			global: [ ],
		},
		
		getRequiredStength: function (levelOrdinal) {
			if (levelOrdinal <= 1) return 0;
			if (levelOrdinal == 2) return 8;
			if (levelOrdinal == 3) return 14;
			if (levelOrdinal == 4) return 17;
			if (levelOrdinal == 5) return 21;
			if (levelOrdinal == 6) return 28;
			if (levelOrdinal == 7) return 36;
			if (levelOrdinal == 8) return 44;
			if (levelOrdinal == 9) return 48;
			if (levelOrdinal == 10) return 68;
			if (levelOrdinal == 11) return 89;
			if (levelOrdinal == 12) return 97;
			if (levelOrdinal == 13) return 120;
			if (levelOrdinal == 14) return 165;
			if (levelOrdinal == 15) return 193;
			if (levelOrdinal == 16) return 251;
			if (levelOrdinal == 17) return 332;
			if (levelOrdinal == 18) return 378;
			if (levelOrdinal == 19) return 537;
			return 755;
		},
		
		// get enemies by type (string) and difficulty (1-20)
		// by default will also include enemies of one difficulty lower, if restrictDifficulty, then not
		// will return at least one enemy; if no matching enemy exists, one with lower difficulty is returned
		getEnemies: function (type, difficulty, restrictDifficulty) {
			var enemies = [];
			if (difficulty <= 0) return enemies;
			
			var enemy;
			var enemyDifficulty;
			for (var i = 0; i < this.enemyDefinitions[type].length; i++) {
				enemy = this.enemyDefinitions[type][i];
				enemyDifficulty = this.getEnemyDifficultyLevel(enemy);
				if (enemyDifficulty === difficulty) enemies.push(enemy);
				if (enemyDifficulty === difficulty - 1 && difficulty > 1 && !restrictDifficulty) enemies.push(enemy);
			}
			
			if (enemies.length <= 0) {
				return this.getEnemies(type, difficulty - 1);
			}
			
			return enemies;
		},
		
		getEnemyDifficultyLevel: function (enemy) {
			var stats = enemy.att + enemy.def;
			var level = 0;
			var iDifficulty;
			for(var i = 1; i < WorldCreatorConstants.LEVEL_NUMBER; i++) {
				iDifficulty = this.getRequiredStength(i);
				if (iDifficulty > stats) return level;
				level = i;
			}
			return WorldCreatorConstants.LEVEL_NUMBER;
		}
	};
		
	// For TextConstants: nouns and verbs to describe enemies
	var nPest = "urban pests";
	var nAnimal = "aggressive animals";
	var nGangster = "bandits";
	var nBot = "bots";
	
	var aPatrol = "patrolled by";
	var aGuard = "guarded by";
	var aInfest = "infested with";
	var aCover = "covered in";
	
	var dCleared = "cleared";
	var dDisabled = "disabled";
	var dKilled = "killed";
	var dDrive = "driven away";
	
	// Enemy definitions (level: level ordinal, difficulty: 1-10, attRatio: 0-1, rarity: 0-100)
	var createEnemy = function (name, type, nouns, activeV, defeatedV, level, difficulty, attRatio, rarity) {
		var reqStr = EnemyConstants.getRequiredStength(level);
		var reqStrPrev = EnemyConstants.getRequiredStength(level-1);
		var reqStrNext = EnemyConstants.getRequiredStength(level+1);
		var statsMin = Math.max(0, reqStr - (reqStr-reqStrPrev) * 0.5);
		var statsMax = Math.max(2, reqStr + (reqStrNext - reqStr) * 0.5);
		if (reqStr == reqStrNext) {
			statsMax = Math.max(2, reqStr + (reqStr-reqStrPrev) * 0.5);
		}
		
		var stats = statsMin + (statsMax-statsMin)/10*difficulty;
		var att = Math.max(1, Math.round(stats * attRatio));
		var def = Math.max(1, Math.round(stats * (1 - attRatio)));
		return new EnemyVO(name, type, nouns, activeV, defeatedV, att, def, rarity);
	};
    
    EnemyConstants.enemyDefinitions.global.push(createEnemy("giant centipede", "global", [nPest,nAnimal], [aInfest], [dCleared], 1, 4, 0.4, 50));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("poisonous centipede", "global", [nPest,nAnimal], [aInfest], [dCleared], 2, 4, 0.4, 50));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("radioactive cockroach", "global", [nPest,nAnimal], [aInfest,aCover], [dCleared], 3, 3, 0.1));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("cave bat", "global", [nPest,nAnimal], [aInfest], [dCleared,dDrive], 4, 5, 0.6, 20));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("vampire bat", "global", [nPest,nAnimal], [aInfest], [dCleared,dDrive], 5, 5, 0.7, 70));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("poisonous spider", "global", [nPest,nAnimal], [aInfest,aGuard], [dKilled], 6, 5, 0.8, 20));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("gigantic spider", "global", [nPest,nAnimal], [aInfest,aGuard], [dKilled], 7, 5, 0.8, 20));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("albino salamander", "global", [nPest,nAnimal], [aInfest], [dKilled], 8, 5, 0.6, 50));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("fire salamander", "global", [nPest,nAnimal], [aInfest], [dKilled], 9, 5, 0.6, 50));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("rusted guard bot", "global", [nPest,nBot], [aPatrol,aGuard,aInfest], [dDisabled], 10, 5, 0.5, 65));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("ancient guard bot", "global", [nPest,nBot], [aPatrol,aGuard,aInfest], [dDisabled], 11, 5, 0.3, 65));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("robot from a forgotten war", "global", [nPest,nBot], [aGuard,aInfest], [dDisabled], 12, 5, 0.5, 60));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("drone from a forgotten war", "global", [nPest,nBot], [aGuard,aInfest], [dDisabled], 13, 5, 0.5, 60));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("malfunctioning fire door", "global", [nBot], [aGuard], [dDisabled], 14, 7, 0.1, 65));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("antagonistic fire door", "global", [nBot], [aGuard], [dDisabled], 15, 7, 0.2, 50));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("territorial sewer varanid", "global", [nAnimal], [aGuard], [dKilled,dDrive], 16, 8, 0.7, 85));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("predatory sewer varanid", "global", [nAnimal], [aGuard], [dKilled,dDrive], 17, 8, 0.8, 85));
    EnemyConstants.enemyDefinitions.global.push(createEnemy("haywire guard bot 1", "global", [nBot], [aPatrol,aGuard,aInfest], [dDisabled], 18, 5, 0.2, 50));    
    EnemyConstants.enemyDefinitions.global.push(createEnemy("haywire guard bot 2", "global", [nBot], [aPatrol,aGuard,aInfest], [dDisabled], 19, 5, 0.7, 50));    
    EnemyConstants.enemyDefinitions.global.push(createEnemy("haywire guard bot 3", "global", [nBot], [aPatrol,aGuard,aInfest], [dDisabled], 20, 5, 0.6, 50));    
    
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("wasp", "earth", [nAnimal], [aInfest], [dDrive], 5, 5, 0.75));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("bee", "earth", [nAnimal], [aInfest], [dDrive], 6, 5, 0.25, 70));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("spirit of earth", "earth", [], [aGuard], [dDrive], 7, 5, 0.2, 25));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("spirit of wind", "earth", [], [aGuard], [dDrive], 8, 8, 0.8, 35));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("spirit of fire", "earth", [], [aGuard], [dDrive], 9, 6, 0.6, 45));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("spirit of sun", "earth", [], [aGuard], [dDrive], 10, 6, 0.2, 55));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("vengeful dryad", "earth", [], [aGuard], [dDrive], 11, 8, 0.5, 90));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("vampire", "earth", [], [], [dDrive], 12, 8, 0.8, 90));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("ape", "earth", [nAnimal], [aGuard], [dDrive], 13, 5, 0.5));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("bear", "earth", [nAnimal], [], [dDrive], 14, 6, 0.6));
    EnemyConstants.enemyDefinitions.earth.push(createEnemy("drove of boars", "earth", [nAnimal], [], [dDrive], 15, 5, 0.8));
		
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("radioactive rat", "inhabited", [nPest,nAnimal], [aInfest], [dCleared], 1, 5, 0.75));
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("security bot", "inhabited", [nBot], [aPatrol,aGuard], [dDisabled], 14, 5, 0.3));
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("rabid dog", "inhabited", [nPest,nAnimal], [aInfest], [dKilled], 15, 5, 0.6));
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("leaking gas pipe", "inhabited", [], [], [dCleared], 16, 4, 0.2, 75));
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("mugger", "inhabited", [nGangster], [aInfest], [dDrive], 17, 5, 0.5, 15));
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("doomsayer", "inhabited", [], [aPatrol], [dDrive], 18, 4, 0.6, 45));
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("armed gangster", "inhabited", [nGangster], [aPatrol,aGuard,aInfest], [], 19, 6, 0.8, 75));
    EnemyConstants.enemyDefinitions.inhabited.push(createEnemy("sector emergency system", "inhabited", [nBot], [aGuard], [], 20, 5, 0.7, 25));
    
    EnemyConstants.enemyDefinitions.sunlit.push(createEnemy("thorny bush", "sunlit", [nPest], [aInfest,aCover], [], 1, 5, 0.5));
    EnemyConstants.enemyDefinitions.sunlit.push(createEnemy("overgrown nettle", "sunlit", [nPest], [aInfest,aCover], [], 2, 5, 0.25));
    EnemyConstants.enemyDefinitions.sunlit.push(createEnemy("hawk", "sunlit", [nPest,nAnimal], [aInfest], [], 4, 5, 0.3, 50));
    EnemyConstants.enemyDefinitions.sunlit.push(createEnemy("scorpion", "sunlit", [nPest,nAnimal], [aInfest], [], 5, 5, 0.7));
    EnemyConstants.enemyDefinitions.sunlit.push(createEnemy("territorial magpie", "sunlit", [nPest,nAnimal], [aInfest], [], 6, 4, 0.7, 35));
    EnemyConstants.enemyDefinitions.sunlit.push(createEnemy("great black pelican", "sunlit", [nPest,nAnimal], [aInfest,aGuard], [dKilled,dDrive], 9, 5, 0.5, 35));
		
    EnemyConstants.enemyDefinitions.urban.push(createEnemy("swarm of pidgeons", "urban", [nPest,nAnimal], [aInfest], [dDrive], 14, 5, 0.75, 10));
    EnemyConstants.enemyDefinitions.urban.push(createEnemy("agitated murder of crows", "urban", [nPest,nAnimal], [aInfest], [dDrive], 15, 5, 0.3));
    EnemyConstants.enemyDefinitions.urban.push(createEnemy("aggressive raccoon", "urban", [nPest,nAnimal], [], [], 16, 5, 0.6, 40));
    EnemyConstants.enemyDefinitions.urban.push(createEnemy("escaped pet boa", "urban", [nAnimal], [aInfest], [], 17, 7, 0.5, 85));
    EnemyConstants.enemyDefinitions.urban.push(createEnemy("military bot", "urban", [nBot], [aPatrol,aGuard], [dDisabled], 18, 5, 0.8, 85));
    EnemyConstants.enemyDefinitions.urban.push(createEnemy("escaped zoo panther", "urban", [nAnimal,aGuard], [], [], 19, 8, 0.8, 90));
    EnemyConstants.enemyDefinitions.urban.push(createEnemy("injured zoo panther", "urban", [nAnimal], [], [], 20, 8, 0.6, 95));
    
    return EnemyConstants;
    
});