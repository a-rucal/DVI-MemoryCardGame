/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 */
MemoryGame = function (gs) {
    /**
     * Array con los tipos posibles de cartas
     */
    this.cardType = ["8-ball", "potato", "dinosaur", "kronos", "rocket", "unicorn", "guy", "zeppelin"];

    /**
     * Representa a las cartas en el tablero del juego.
     */
    this.board = [];

    /**
     * El mensaje que se muestra en el juego.
     */
    this.message = "Memory Game";

    /**
     * Indica el número de parejas encontradas.
     */
    this.points = 0;

    /**
     * Indica la posición de la carta volteadas bocaarriba. Solo habrá una almacenada en memoria para comprobar las parejas.
     */
    this.flipped = -1;
	
	/**
     * Indica el estado del juego. Parado si stop= 1 o en juego si stop = 0
     */
    this.stop = 0;

    /**
     * Inicializa el juego creando las cartas (recuerda que son 2 de cada tipo de carta),
     * desordenándolas y comenzando el bucle de juego.
     */
    this.initGame = function () {
        var cardPos = []; //posiciones posibles dentro del tablero [0 al 15}
        for (var i = 0; i < this.cardType.length * 2; i++) {
            cardPos.push(i);
        }

        var pos; //indice aleatorio generado para cardPos.
        var posType = 0; //indice dentro de cardType. Se incrementa cada dos iterraciones porque se crean dos cartas de cada tipo.
        var posCard; //indice dentro de cardPos.

        for (var i = 0; i < this.cardType.length * 2; i++) {
            pos = getRandom(cardPos.length);
            posCard = cardPos[pos];
            cardPos.splice(pos, 1);
            var newCard = new MemoryGameCard(this.cardType[posType]);
            this.board[posCard] = newCard;
            if (i % 2 != 0) {
                posType++;
            }
        }

        this.loop();
    };

    /**
     * Dibuja el juego:
     * 1. Escribe el mensaje con el estado actual del juego.
     * 2. Pide a cada una de las cartas del tablero que se dibujen.
     */
    this.draw = function () {
        gs.drawMessage(this.message);
        for (var i = 0; i < this.board.length; i++) {
            this.board[i].draw(gs, i);
        };
    };

    /**
     * Es el bucle del juego.
     * Consiste en llamar al método draw cada 16ms. 
     */
    this.loop = function () {
        var idInter = setInterval(play, 20, this);

        function play(mg) {
            if (mg.points < mg.cardType.length + 1) {
                mg.draw();  
            }else{
                clearInterval(idInter);
            }
        };
    };


    /**
     * Este método se llama cada vez que el jugador pulsa sobre alguna de las 
     * cartas (identificada por el número que ocupan en el array de cartas del 
     * juego). Es el responsable de voltear la carta y, si hay dos volteadas, 
     * comprobar si son la misma (en cuyo caso las marcará como encontradas). 
     * En caso de no ser la misma las volverá a poner boca abajo.
     */
    this.onClick = function (cardId) {
        if (this.points < this.cardType.length && this.stop == 0) {  //condiciones de parada de juego
			//condiciones para el indice de la carta dado
            if (((cardId => 0 && cardId < this.board.length) && cardId != this.flipped) && this.board[cardId].state != 4) {
                this.board[cardId].flip();

                if (this.flipped == -1) { //no hay otra dada la vuelta
                    this.flipped = cardId;
                } else { //hay otra dada la vuelta
					//si son del mismo tipo
                    if (this.board[cardId].compareTo(this.board[this.flipped].id)) {
                        this.message = (this.points < this.cardType.length - 1) ? "Match found" : "You win!";
                        this.board[cardId].found();
                        this.board[this.flipped].found();
                        this.points++;
                    } else {  //si son distintas
                        this.message = "Try again";
                        gs.drawMessage(this.message);
						this.stop = 1;
						var idInter = setTimeout(flipBack(cardId, this.flipped), 400);

                        function flipBack(cardId, otherId){
							var c1 = cardId;
							var c2 = otherId;
							return function reFlipBack(){
								 game.board[cardId].flip();
                                 game.board[otherId].flip();
								 game.stop = 0;
							};
                        };
                    }
                    this.flipped = -1;
                }
            }
        }
    };


};



/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function (id) {
    this.id = id;
    /**
     * Los estados de la carta son:
     * 0 > para bocaabajo
     * 2 > para bocaarriba
     * 4 > para encontrada
     * Por defecto se crean bocaabajo.
     */
    this.state = 0;

    /**
     * Da la vuelta a la carta, cambiando el estado de la misma.
     */
    this.flip = function () {
        if (this.state != 4) {
            this.state = (this.state == 0) ? 2 : 0;
        }
    };

    /**
     * Marca una carta como encontrado, cambiando el estado de la misma.
     */
    this.found = function () {
        this.state = 4;
    };

    /**
     * Compara dos cartas, devolviendo true si ambas representan la misma carta.
     */
    this.compareTo = function (otherCard) {
        var res = false;
        if (this.id == otherCard) {
            res = true;
        }
        return res;
    };

    /**
     * Dibuja la carta de acuerdo al estado en el que se encuentra.
     */
    this.draw = function (gs, pos) {
        var tile = (this.state == 0) ? "back" : this.id;
        gs.draw(tile, pos);
    };


};

/**
 * Genera un número aleatorio que
 */
function getRandom(max) {
    return Math.floor(Math.random() * max);
};
