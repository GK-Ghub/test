  
  // The list of all the possible orientations
    var allOrientations = ['horizontal','horizontalBack','vertical','verticalUp',
                           'diagonal','diagonalUp','diagonalBack','diagonalUpBack'];

    // The definition of the orientation, calculates the next square given a
    // starting square (x,y) and distance (i) from that square.
    var orientations = {
      horizontal:     function(x,y,i) { return {x: x+i, y: y  }; },
      horizontalBack: function(x,y,i) { return {x: x-i, y: y  }; },
      vertical:       function(x,y,i) { return {x: x,   y: y+i}; },
      verticalUp:     function(x,y,i) { return {x: x,   y: y-i}; },
      diagonal:       function(x,y,i) { return {x: x+i, y: y+i}; },
      diagonalBack:   function(x,y,i) { return {x: x-i, y: y+i}; },
      diagonalUp:     function(x,y,i) { return {x: x+i, y: y-i}; },
      diagonalUpBack: function(x,y,i) { return {x: x-i, y: y-i}; }
    };

    // Determines if an orientation is possible given the starting square (x,y),
    // the height (h) and width (w) of the puzzle, and the length of the word (l).
    // Returns true if the word will fit starting at the square provided using
    // the specified orientation.
    var checkOrientations = {
      horizontal:     function(x,y,h,w,l) { return w >= x + l; },
      horizontalBack: function(x,y,h,w,l) { return x + 1 >= l; },
      vertical:       function(x,y,h,w,l) { return h >= y + l; },
      verticalUp:     function(x,y,h,w,l) { return y + 1 >= l; },
      diagonal:       function(x,y,h,w,l) { return (w >= x + l) && (h >= y + l); },
      diagonalBack:   function(x,y,h,w,l) { return (x + 1 >= l) && (h >= y + l); },
      diagonalUp:     function(x,y,h,w,l) { return (w >= x + l) && (y + 1 >= l); },
      diagonalUpBack: function(x,y,h,w,l) { return (x + 1 >= l) && (y + 1 >= l); }
    };

    // Determines the next possible valid square given the square (x,y) was ]
    // invalid and a word lenght of (l).  This greatly reduces the number of
    // squares that must be checked. Returning {x: x+1, y: y} will always work
    // but will not be optimal.
    var skipOrientations = {
      horizontal:     function(x,y,l) { return {x: 0,   y: y+1  }; },
      horizontalBack: function(x,y,l) { return {x: l-1, y: y    }; },
      vertical:       function(x,y,l) { return {x: 0,   y: y+100}; },
      verticalUp:     function(x,y,l) { return {x: 0,   y: l-1  }; },
      diagonal:       function(x,y,l) { return {x: 0,   y: y+1  }; },
      diagonalBack:   function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y    }; },
      diagonalUp:     function(x,y,l) { return {x: 0,   y: y<l-1?l-1:y+1  }; },
      diagonalUpBack: function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y  }; }
    };

	

	
	var options = {
		height: 8,
		width: 15,
		preferOverlap: true
		}
	
	  var words = ['save', 'earn', 'invest', 'retirement', 'account', 'money', 'credit', 'debt', 'assets', 'loan', 'interest', 'accrual',
 'economy', 'sharing', 'savings', 'budget', 'capital', 'collateral', 'bond', 'market', 'value', 'index'];
 
   var fillPuzzle = function (words, options) {

      var puzzle = [], i, j, len;
      console.log('options = ', options);

      // initialize the puzzle with blanks
      for (i = 0; i < options.height; i++) {
        puzzle.push([]);
        for (j = 0; j < options.width; j++) {
          puzzle[i].push('');
        }
      }

      // add each word into the puzzle one at a time
      for (i = 0, len = words.length; i < len; i++) {
          placeWordInPuzzle(puzzle, options, words[i]);
      }

      // return the puzzle
      return puzzle;
    };
	
	var placeWordInPuzzle = function (puzzle, options, word) {

      // find all of the best locations where this word would fit
      var locations = findBestLocations(puzzle, options, word);

      if (locations.length === 0) {
        return false;
      }

      // select a location at random and place the word there
	  console.log(locations);
      var sel = locations[Math.floor(Math.random() * locations.length)];
      placeWord(puzzle, word, sel.x, sel.y, orientations[sel.orientation]);

      return true;
    };
	
	var findBestLocations = function (puzzle, options, word) {

      var locations = [],
          height = options.height,
          width = options.width,
          wordLength = word.length,
          maxOverlap = 0; // we'll start looking at overlap = 0

      // loop through all of the possible orientations at this position
      for (var k = 0, len = allOrientations.length; k < len; k++) {
        
        var orientation = allOrientations[k],
            check = checkOrientations[orientation],
            next = orientations[orientation],
            skipTo = skipOrientations[orientation],
            x = 0, y = 0;

        // loop through every position on the board
        while( y < height ) {

          // see if this orientation is even possible at this location
          if (check(x, y, height, width, wordLength)) {

            // determine if the word fits at the current position
            var overlap = calcOverlap(word, puzzle, x, y, next);

            // if the overlap was bigger than previous overlaps that we've seen
            if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
              maxOverlap = overlap;
              locations.push({x: x, y: y, orientation: orientation, overlap: overlap});
            }

            x++;
            if (x >= width) {
              x = 0;
              y++;
            }
          }
          else {
            // if current cell is invalid, then skip to the next cell where
            // this orientation is possible. this greatly reduces the number
            // of checks that we have to do overall
            var nextPossible = skipTo(x,y,wordLength);
            x = nextPossible.x;
            y = nextPossible.y;
          }

        }
      }

      // finally prune down all of the possible locations we found by
      // only using the ones with the maximum overlap that we calculated
	  
      return options.preferOverlap ?
             pruneLocations(locations, maxOverlap) :
             locations;
	 // return locations;
    };
	
	var calcOverlap = function (word, puzzle, x, y, fnGetSquare) {
      var overlap = 0;

      // traverse the squares to determine if the word fits
      for (var i = 0, len = word.length; i < len; i++) {

        var next = fnGetSquare(x, y, i),
            square = puzzle[next.y][next.x];
        
        // if the puzzle square already contains the letter we
        // are looking for, then count it as an overlap square
        if (square === word[i]) {
          overlap++;
        }
        // if it contains a different letter, than our word doesn't fit
        // here, return -1
        else if (square !== '' ) {
          return -1;
        }
      }

      // if the entire word is overlapping, skip it to ensure words aren't
      // hidden in other words
      return overlap;
    };
	
	    var pruneLocations = function (locations, overlap) {

      var pruned = [];
      for(var i = 0, len = locations.length; i < len; i++) {
        if (locations[i].overlap >= overlap) {
          pruned.push(locations[i]);
        }
      }

      return pruned;
    };
	
	    var placeWord = function (puzzle, word, x, y, fnGetSquare) {
      for (var i = 0, len = word.length; i < len; i++) {
        var next = fnGetSquare(x, y, i);
        puzzle[next.y][next.x] = word[i];
      }
    };
	
	
	
	
	// ------------
	var puzzle1 = fillPuzzle(words, options);
	
	
	
	
	 function solve (puzzle, words) {
        var options = {
                        height:       puzzle.length,
                        width:        puzzle[0].length,
                        orientations: allOrientations,
                        preferOverlap: true
                      },
            found = [],
            notFound = [];

        for(var i = 0, len = words.length; i < len; i++) {
          var word = words[i],
              locations = findBestLocations(puzzle, options, word);

          if (locations.length > 0 && locations[0].overlap === word.length) {
            locations[0].word = word;
            found.push(locations[0]);
          }
          else {
            notFound.push(word);
          }
        }

        return { found: found, notFound: notFound };
      }