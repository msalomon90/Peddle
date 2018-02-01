/*
  Sanjay Soundarajan
  109146095
  Follow the development of this project: https://github.com/megasanjay/CSCI130/tree/master/Gomoku
*/

var table;
var tableSize;
var gridcell;
var gridArray;
var gridColor;
var currentPlayer;
var turnCount = 0;
var playerGameMode;
var player1Color;
var player2Color;
var winOpacity;
var startTime;
var runTimer;
var moves = [];

function timingFunction()   // function for the timer
{
  let seconds;
  let currentTime = Date.now();
  let minutes = parseInt(((currentTime - startTime) / 1000) / 60);

  if(minutes > 0)
  {
    seconds = ((currentTime - startTime) / 1000) - (minutes * 60);
  }
  else
  {
    seconds = (currentTime - startTime) / 1000;
  }

  if (minutes != 0)
  {
    if (minutes == 1)
    {
      document.getElementById('runningTimer').innerHTML = minutes.toString() + " Minute and " + (parseInt(seconds)).toString() + " Seconds";
    }
    else
    {
      document.getElementById('runningTimer').innerHTML = minutes.toString() + " Minutes and " + (parseInt(seconds)).toString() + " Seconds";
    }

  }
  else
  {
    document.getElementById('runningTimer').innerHTML = (parseInt(seconds)).toString() + " Seconds";
  }
}

function gameModeFunction(input)  // function for the game mode button
{
  document.getElementById('p1PieceCounter').innerHTML = 0;
  document.getElementById('p2PieceCounter').innerHTML = 0;
  document.getElementById("totalPieceCounter").innerHTML = 0;

  if (input == 1) // Computer vs You
  {
    playerGameMode = 1;
    alert("You are now playing against the computer! You get to play the first move");

    resizeTable(15);

    gridColor = 'white';
    changeGridColor(gridColor);
    player1Color = player2Color = 'red';
    changeP1Color(player1Color);
    changeP2Color(player2Color)
  }
  else if (input == 3) // Reset
  {
    if (!tableSize)
    {
      resizeTable(15);

      gridColor = 'white';
      changeGridColor(gridColor);
      player1Color = player2Color = 'red';
      changeP1Color(player1Color);
      changeP2Color(player2Color);
    }
    else
    {
      resizeTable(tableSize);
      changeGridColor(gridColor);
      changeP1Color(player1Color);
      changeP2Color(player2Color);
    }
  }
  else // 2v2
  {
    playerGameMode = 2;
    alert("You are now in the Player v. Player mode. Please take turns at selecting where you want to set your piece.");

    resizeTable(15);

    gridColor = 'white';
    changeGridColor(gridColor);
    player1Color = player2Color = 'red';
    changeP1Color(player1Color);
    changeP2Color(player2Color);
  }
}

function suggestMoveFunction() // function to suggest the next best move
{
  if (turnCount == 0)
  {
    errorFunction('suggestOnEmpty');
    return;
  }

  table = document.getElementById('gTable');
  moves = [];

  twoVTwoResponse();
  removeDuplicates();
  x = generateMove();

  y = "cellr" + x.row + "c" + x.column;
  document.getElementById(y).classList.add("flashClass");
}

function clickButton(i,j) // Click function for the grid
{
  document.getElementById('suggestMove').disabled = false;
  x = document.getElementsByClassName("flashClass");
 if (x.length == 0)
 {
   clickFunction(i,j);
 }
 else
 {
   x[0].classList.remove("flashClass");
   clickFunction(i,j);
 }
}

function resizeTable(tsize) // resize the table
{
  let row;
  let cell;
  document.getElementById("turnCounter").innerHTML = 0;

  tableSize = tsize;

  turnCount = 1;
  currentPlayer = 'p1';
  gameState = 'inProgress';

  gridArray = new Array(tsize);

  startTime = Date.now();
  runTimer = setInterval(timingFunction, 300);

  for (let i = 0; i < tsize; i++)
  {
    gridArray[i] = new Array(tsize);
  }

  for (let i = 0; i < tsize; i++)
  {
    for (let j = 0; j < tsize; j++)
    {
      gridArray[i][j] = 0;
    }
  }

  table = document.getElementById("gTable");
  table.classList.remove("noClick");

	table.innerHTML = " ";

	for(let i = 0; i < tableSize; i++)
	{
		row = table.insertRow(i);
		for (let j = 0; j < tableSize ; j++)
		{
			cell = row.insertCell(j);
			cell.innerHTML = '<button class = "gridCell" id = "cellr' + i + 'c' + j + '" onclick = "clickButton(' + i + ',' + j + ')"></button>';
		}
	}
}

function clickFunction(i, j)  // click function for the grid
{
  let winWinNoMatterWhat;

  document.getElementById('turnCounter').innerHTML = turnCount;

  if (turnCount % 2 == 0)
  {
    currentPlayer = 'p2';
    document.getElementById('p2PieceCounter').innerHTML = parseInt(turnCount/2);
  }
  else
  {
    document.getElementById('p1PieceCounter').innerHTML = parseInt(turnCount/2) + 1;
    currentPlayer = 'p1';
  }

  if ((gridArray[i][j] == 1) || (gridArray[i][j] == 2))
  {
    errorFunction('taken')
    return;
  }


  if (currentPlayer == 'p1')
  {
    gridArray[i][j] = 1;
  }
  else
  {
    gridArray[i][j] = 2;
  }

  displayFunction(i,j);
  turnCount++;

  winWinNoMatterWhat = checkWin();
  if (winWinNoMatterWhat == 1)  // Player 1 wins
  {
    clearInterval(runTimer);
    
    let totalTime = document.getElementById('runningTimer').innerHTML;
    
    alert("Player ❌ wins. This game only lasted " + totalTime + "!");
    return;
  }
  else if (winWinNoMatterWhat == 2) // player 2 wins
  {
    clearInterval(runTimer);
    
    let totalTime = document.getElementById('runningTimer').innerHTML;
    
    alert("Player ⭕️ wins. This game only lasted " + totalTime + "!");
    return;
  }

  if (playerGameMode == 1 && currentPlayer == 'p2') // AI response
  {
    moves = [];
    twoVTwoResponse();
    removeDuplicates();

    x = generateMove();

    makeAIMove(x.row, x.column);
  }
}

function makeAIMove(i, j)
{
  clickFunction(i,j);
}

function generateMove() // generate the computer's move
{
  // 'a' for horizontal moves
  // 'b' for vertical moves
  // 'c' for left-diagonal moves
  // 'd' for right-diagonal moves

  for(i in moves)
  {
    x = moves[i];

    if (x.streak == 1)
    {
      if (x.type == 'a')
      {
        if ((x.row + 1) < tableSize)
        {
          if (gridArray[x.row + 1][x.column] == 0)
          {
            y.row = x.row + 1;
            y.column = x.column;
            return y;
          }
        }
      }
      if (x.type == 'b')
      {
        if (x.column + 1 < tableSize)
        {
          if (gridArray[x.row][x.column + 1] == 0)
          {
            y.row = x.row;
            y.column = x.column + 1;
            return y;
          }
        }
      }
      if (x.type == 'c')
      {
        if (((x.row + 1) < tableSize) && ((x.column - 1) >= 0))
        {
          if (gridArray[x.row + 1][x.column - 1] == 0)
          {
            y.row = x.row + 1;
            y.column = x.column - 1;
            return y;
          }
        }
      }
      if (x.type == 'd')
      {
        if (((x.row + 1) < tableSize) && ((x.column + 1) < tableSize))
        {
          if (gridArray[x.row + 1][x.column + 1] == 0)
          {
            y.row = x.row + 1;
            y.column = x.column + 1;
            return y;
          }
        }
      }
    }

    if (x.streak == 2)
    {
      if (x.type == 'a')
      {
        if ((x.row + 2) < tableSize)
        {
          if (gridArray[x.row + 2][x.column] == 0)
          {
            y.row = x.row + 2;
            y.column = x.column;
            return y;
          }
          else
          {
            if ((x.row - 1) >= 0)
            {
              if (gridArray[x.row - 1][x.column] == 0)
              {
                y.row = x.row - 1;
                y.column = x.column;
                return y;
              }
            }
          }
        }
        else
        {
          if ((x.row - 1) >= 0)
          {
            if (gridArray[x.row - 1][x.column] == 0)
            {
              y.row = x.row - 1;
              y.column = x.column;
              return y;
            }
          }
        }
      }
      if (x.type == 'b')
      {
        if ((x.column + 2) < tableSize)
        {
          if (gridArray[x.row][x.column + 2] == 0)
          {
            y.row = x.row;
            y.column = x.column + 2;
            return y;
          }
          else
          {
            if ((x.column - 1) >= 0)
            {
              if (gridArray[x.row][x.column - 1] == 0)
              {
                y.row = x.row;
                y.column = x.column - 1;
                return y;
              }
            }
          }
        }
        else
        {
          if ((x.column - 1) >= 0)
          {
            if (gridArray[x.row][x.column - 1] == 0)
            {
              y.row = x.row;
              y.column = x.column - 1;
              return y;
            }
          }
        }
      }
      if (x.type == 'c')
      {
        if (((x.row + 2) < tableSize) && ((x.column - 2) >= 0))
        {
          if (gridArray[x.row + 2][x.column - 2] == 0)
          {
            y.row = x.row + 2;
            y.column = x.column - 2;
            return y;
          }
          else
          {
            if (((x.row - 1) >= 0) && ((x.column + 1) < tableSize))
            {
              if (gridArray[x.row - 1][x.column + 1] == 0)
              {
                y.row = x.row - 1;
                y.column = x.column + 1;
                return y;
              }
            }
          }
        }
        else
        {
          if (((x.row - 1) >= 0) && ((x.column + 1) < tableSize))
          {
            if (gridArray[x.row - 1][x.column + 1] == 0)
            {
              y.row = x.row - 1;
              y.column = x.column + 1;
              return y;
            }
          }
        }
      }
      if (x.type == 'd')
      {
        if (((x.row + 2) < tableSize) && ((x.column + 1) < tableSize))
        {
          if (gridArray[x.row + 2][x.column + 1] == 0)
          {
            y.row = x.row + 2;
            y.column = x.column + 1;
            return y;
          }
          else
          {
            if (((x.row - 1) >= 0) && ((x.column - 1) >= 0))
            {
              if (gridArray[x.row - 1][x.column - 1] == 0)
              {
                y.row = x.row - 1;
                y.column = x.column - 1;
                return y;
              }
            }
          }
        }
        else
        {
          if (((x.row - 1) >= 0) && ((x.column - 1) >= 0))
          {
            if (gridArray[x.row - 1][x.column - 1] == 0)
            {
              y.row = x.row - 1;
              y.column = x.column - 1;
              return y;
            }
          }
        }
      }
    }

    if (x.streak == 3 || x.streak == 4)
    {
      if (x.type == 'a')
      {
        if ((x.row + 2) < tableSize)
        {
          if (gridArray[x.row + 2][x.column] == 0)
          {
            y.row = x.row + 2;
            y.column = x.column;
            return y;
          }
          else
          {
            if ((x.row - (x.streak - 1)) >= 0)
            {
              if (gridArray[x.row - (x.streak - 1)][x.column] == 0)
              {
                y.row = x.row - (x.streak - 1);
                y.column = x.column;
                return y;
              }
            }
          }
        }
        else
        {
          if ((x.row - (x.streak - 1)) >= 0)
          {
            if (gridArray[x.row - (x.streak - 1)][x.column] == 0)
            {
              y.row = x.row - (x.streak - 1);
              y.column = x.column;
              return y;
            }
          }
        }
      }
      if (x.type == 'b')
      {
        if (x.column + 2 < tableSize)
        {
          if (gridArray[x.row][x.column + 2] == 0)
          {
            y.row = x.row ;
            y.column = x.column + 2;
            return y;
          }
          else
          {
            if ((x.column - (x.streak - 1)) >= 0)
            {
              if (gridArray[x.row][x.column - (x.streak - 1)] == 0)
              {
                y.row = x.row;
                y.column = x.column - (x.streak - 1);
                return y;
              }
            }
          }
        }
        else
        {
          if ((x.column - (x.streak - 1)) >= 0)
          {
            if (gridArray[x.row][x.column - (x.streak - 1)] == 0)
            {
              y.row = x.row;
              y.column = x.column - (x.streak - 1);
              return y;
            }
          }
        }
      }
      if (x.type == 'c')
      {
        if (((x.row + 2) < tableSize) && ((x.column - 2) >= 0))
        {
          if (gridArray[x.row + 2][x.column - 2] == 0)
          {
            y.row = x.row + 2;
            y.column = x.column - 2;
            return y;
          }
          else
          {
            if (((x.row - (x.streak - 1)) >= 0) && ((x.column + (x.streak - 1)) < tableSize))
            {
              if (gridArray[x.row - (x.streak - 1)][x.column + (x.streak - 1)] == 0)
              {
                y.row = x.row - (x.streak - 1);
                y.column = x.column + (x.streak - 1);
                return y;
              }
            }
          }
        }
        else
        {
          if (((x.row - (x.streak - 1)) >= 0) && ((x.column + (x.streak - 1)) < tableSize))
          {
            if (gridArray[x.row - (x.streak - 1)][x.column + (x.streak - 1)] == 0)
            {
              y.row = x.row - (x.streak - 1);
              y.column = x.column + (x.streak - 1);
              return y;
            }
          }
        }
      }
      if (x.type == 'd')
      {
        if (((x.row + 2) < tableSize) && ((x.column + 2) < tableSize))
        {
          if (gridArray[x.row + 2][x.column + 2] == 0)
          {
            y.row = x.row + 2;
            y.column = x.column + 2;
            return y;
          }
          else
          {
            if (((x.row - (x.streak - 1)) >= 0) && ((x.column - (x.streak - 1)) >= 0))
            {
              if (gridArray[x.row - (x.streak - 1)][x.column - (x.streak - 1)] == 0)
              {
                y.row = x.row - (x.streak - 1);
                y.column = x.column - (x.streak - 1);
                return y;
              }
            }
          }
        }
        else
        {
          if (((x.row - (x.streak - 1)) >= 0) && ((x.column - (x.streak - 1)) >= 0))
          {
            if (gridArray[x.row - (x.streak - 1)][x.column - (x.streak - 1)] == 0)
            {
              y.row = x.row - (x.streak - 1);
              y.column = x.column - (x.streak - 1);
              return y;
            }
          }
        }
      }
    }
  }
}

function removeDuplicates() // cleanup function for list of legal moves
{
  for(i in moves)
  {
    x = moves[i];
    for(j in moves)
    {
      y = moves[j];

      if (x.streak == y.streak && x.row == y.row && x.column == y.column && x.type == y.type && x.index != y.index)
      {
        moves.splice(j,1);
      }
    }
  }
  moves.sort
  (
    function(a,b)
    {
      var sorter = b.streak - a.streak;

      if (sorter)
      {
        return sorter;
      }

      var tieSorter = b.type - a.type;
      return tieSorter;
    }
  );
}

function twoVTwoResponse() // helper function for AI
{
  index = 1;

  // Right diagonal check
  for (let row = 0; row < tableSize - 1; row++)
  {
    for (let column = 0; column < tableSize - 1; column++)
    {

      let i, j;
      wincounter = 1;

      for (i = row, j = column; i < tableSize - 1 && j < tableSize - 1; i++, j++)
      {

        if (gridArray[i][j] == 0)
        {
          continue;
        }

        currentSlotPiece = gridArray[i][j];

        if (gridArray[i + 1][j + 1] == currentSlotPiece)
        {
          wincounter++;
        }
        else
        {
          wincounter = 1;
        }

        move = new Object();
        move.index = index++;
        move.streak = wincounter;
        move.row = i;
        move.column = j;
        move.type = 'd';

        moves.push(move);
      }
    }
  }

  // Left diagonal check
  for (let row = 0; row < tableSize - 1; row++)
  {
    for (let column = tableSize - 1; column > 0; column--)
    {
      let i, j;
      wincounter = 1;

      for (i = row, j = column; i < tableSize - 1 && j > 0; i++, j--)
      {

        if (gridArray[i][j] == 0)
        {
          continue;
        }

        currentSlotPiece = gridArray[i][j];

        if (gridArray[i + 1][j - 1] == currentSlotPiece)
        {
          wincounter++;
        }
        else
        {
          wincounter = 1;
        }

        move = new Object();
        move.index = index++;
        move.streak = wincounter;
        move.row = i;
        move.column = j;
        move.type = 'c';

        moves.push(move);
      }
    }
  }

  // horizontal check
  for (let i = 0; i < tableSize; i++)
  {
    wincounter = 1;

    for (let j = 0; j < tableSize - 1; j++)
    {
      if (gridArray[i][j] == 0)
      {
        continue;
      }

      currentSlotPiece = gridArray[i][j];

      if (gridArray[i][j + 1] == currentSlotPiece)
      {
        wincounter++;
      }
      else
      {
        wincounter = 1;
        currentSlotPiece = gridArray[i][j + 1];
      }

      move = new Object();
      move.index = index++;
      move.streak = wincounter;
      move.row = i;
      move.column = j;
      move.type = 'b';

      moves.push(move);
    }
  }

  // Vertical check
  for (let i = 0; i < tableSize; i++)
  {
    wincounter = 1;

    for (let j = 0; j < tableSize - 1; j++)
    {
      if (gridArray[j][i] == 0)
      {
        continue;
      }

      currentSlotPiece = gridArray[j][i];

      if (gridArray[j + 1][i] == currentSlotPiece)
      {
        wincounter++;
      }
      else
      {
        wincounter = 1;
        currentSlotPiece = gridArray[j + 1][i];
      }

      move = new Object();
      move.index = index++;
      move.streak = wincounter;
      move.row = j;
      move.column = i;
      move.type = 'a';

      moves.push(move);
    }
  }

}

function displayFunction(i, j)  // draw the grid
{
  let currentCell = document.getElementById("gTable").rows[i].cells[j];
  document.getElementById("totalPieceCounter").innerHTML = turnCount;

  if (currentPlayer == 'p1')
  {
    currentCell.innerHTML = '<button class = "gridCell player1" id = "cellr' + i + 'c' + j + '" onclick = "clickButton(' + i + ',' + j + ')">X</button>';
    currentPlayer = 'p2';
  }
  else
  {
    currentCell.innerHTML = '<button class = "gridCell player2" id = "cellr' + i + 'c' + j + '" onclick = "clickButton(' + i + ',' + j + ')">O</button>';
    currentPlayer = 'p1';
  }

  changeGridColor(gridColor);
  changeP1Color(player1Color);
  changeP2Color(player2Color);
  
  if ((turnCount == 225 && tableSize == 15) || (turnCount == 361 && tableSize == 19))
  {
    disableButtons();
    errorFunction('fullGrid');
  }
}

function checkWin() // function to check to see if a player has won
{
  let currentSlotPiece;
  let wincounter, x, y;

  // horizontal check
  for (let i = 0; i < tableSize; i++)
  {
    wincounter = 1;

    for (let j = 0; j < tableSize; j++)
    {
      if (gridArray[i][j] == 0)
      {
        continue;
      }

      currentSlotPiece = gridArray[i][j];

      if (gridArray[i][j + 1] == currentSlotPiece)
      {
        wincounter++;
      }
      else
      {
        wincounter = 1;
        currentSlotPiece = gridArray[i][j + 1];
      }

      if (wincounter == 5)
      {
        highlightWinningCells('h', i , j);
        disableButtons();

        return currentSlotPiece;
      }
    }
  }

  // Vertical check
  for (let i = 0; i < tableSize; i++)
  {
    wincounter = 1;

    for (let j = 0; j < tableSize; j++)
    {
      if (gridArray[j][i] == 0)
      {
        continue;
      }

      currentSlotPiece = gridArray[j][i];

      if ((j + 1)  > tableSize - 1)
      {
        continue;
      }

      if (gridArray[j + 1][i] == currentSlotPiece)
      {
        wincounter++;
      }
      else
      {
        wincounter = 1;
        currentSlotPiece = gridArray[j + 1][i];
      }

      if (wincounter == 5)
      {
        highlightWinningCells('v', i, j);
        disableButtons();

        return currentSlotPiece;
      }
    }
  }

  // Right diagonal check
  for (let row = 0; row < tableSize - 4; row++)
  {
    for (let column = 0; column < tableSize - 4; column++)
    {

      let i, j;
      wincounter = 1;

      for (i = row, j = column; i < tableSize - 1 && j < tableSize - 1; i++, j++)
      {

        if (gridArray[i][j] == 0)
        {
          continue;
        }

        currentSlotPiece = gridArray[i][j];

        if (gridArray[i + 1][j + 1] == currentSlotPiece)
        {
          wincounter++;
        }
        else
        {
          wincounter = 1;
        }

        if (wincounter == 5)
        {
          highlightWinningCells('rd', i, j);
          disableButtons();

          return currentSlotPiece;
        }
      }
    }
  }

  // Left diagonal check
  for (let row = 0; row < tableSize - 4; row++)
  {
    for (let column = tableSize - 1; column > 3; column--)
    {
      let i, j;
      wincounter = 1;

      for (i = row, j = column; i < tableSize - 1 && j > 0; i++, j--)
      {
        if (gridArray[i][j] == 0)
        {
          continue;
        }

        currentSlotPiece = gridArray[i][j];

        if (gridArray[i + 1][j - 1] == currentSlotPiece)
        {
          wincounter++;
        }
        else
        {
          wincounter = 1;
        }

        if (wincounter == 5)
        {
          highlightWinningCells('ld', i, j);
          disableButtons();

          return currentSlotPiece;
        }
      }
    }
  }

  return false;
}

function highlightWinningCells(input, i, j) // Show winning cells
{
  winOpacity = 0.6;
  
  if (input == 'h')
  {
    x = "cellr" + i + "c" + (j - 3);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("horizontalCell1");
    
    x = "cellr" + i + "c" + (j - 2);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("horizontalCell2");
    
    x = "cellr" + i + "c" + (j - 1);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("horizontalCell3");

    x = "cellr" + i + "c" + j;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("horizontalCell4");

    x = "cellr" + i + "c" + (j + 1);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("horizontalCell5");
  }

  if (input == 'v')
  {
    x = "cellr" + (j - 3) + "c" + i;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("verticalCell1");

    x = "cellr" + (j - 2) + "c" + i;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("verticalCell2");

    x = "cellr" + (j - 1) + "c" + i;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("verticalCell3");
    
    x = "cellr" + j + "c" + i;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("verticalCell4");

    x = "cellr" + (j + 1) + "c" + i;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("verticalCell5");
  }

  if (input == 'ld')
  {
    x = "cellr" + (i - 3) + "c" + (j + 3);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("leftDiagonalCell1");
    
    x = "cellr" + (i - 2) + "c" + (j + 2);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("leftDiagonalCell2");
    
    x = "cellr" + (i - 1) + "c" + (j + 1);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("leftDiagonalCell3");

    x = "cellr" + i + "c" + j;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("leftDiagonalCell4");

    x = "cellr" + (i + 1) + "c" + (j - 1);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("leftDiagonalCell5");

    
  }

  if (input == 'rd')
  {
    x = "cellr" + (i - 3) + "c" + (j - 3);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("rightDiagonalCell1");
    
    x = "cellr" + (i - 2) + "c" + (j - 2);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("rightDiagonalCell2");
    
    x = "cellr" + (i - 1) + "c" + (j - 1);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("rightDiagonalCell3");
    
    x = "cellr" + i + "c" + j;
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("rightDiagonalCell4");

    x = "cellr" + (i + 1) + "c" + (j + 1);
    y = document.getElementById(x);
    y.style.opacity = winOpacity;
    y.classList.add("rightDiagonalCell5");
  }
}

function errorFunction(errorCode) // error diplay function
{
  switch (errorCode)
  {
    case 'taken':
      alert("This cell has already has a player's piece on it. Please select a slot with no placed pieces on it.");
      break;
    case 'suggestOnEmpty':
      alert("You need to select a game mode under the 'New Game' menu and place at least one piece before a move can be suggested.");
      break;
    case 'fullGrid':
      alert("The entire grid has been filled up. This round ends in a tie-game. Please click the 'Reset' button under the 'New Game' menu to play again.")
  }
}

function disableButtons() // disable appropriate buttons
{
  document.getElementById('gTable').classList.add("noClick");
  document.getElementById('suggestMove').disabled = true;

  list = document.getElementsByClassName('gridCell');
  for (index = 0; index < list.length; ++index)
  {
    list[index].disabled = true;
  }
}

function changeGridColor(gridColorInput)  // function to change the background color of the grid
{
  if (gridColorInput == player1Color || gridColorInput == player2Color)
  {
    choice = confirm("One of the pieces on the grid has the same color as the background you are choosing. Do you still want to go through with the current selection?");
    if (!choice)
    {
      return;
    }
  }

    switch (gridColorInput)
    {
      case 'DeepPink':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "DeepPink";
        }
        gridColor = 'DeepPink';
        break;
      case 'LightSalmon':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "LightSalmon";
        }
        gridColor = 'LightSalmon';
        break;
      case 'Salmon':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Salmon";
        }
        gridColor = 'Salmon';
        break;
      case 'LightCoral':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "LightCoral";
        }
        gridColor = 'LightCoral';
        break;
      case 'Crimson':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Crimson";
        }
        gridColor = 'Crimson';
        break;
      case 'OrangeRed':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "OrangeRed";
        }
        gridColor = 'OrangeRed';
        break;
      case 'Tomato':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Tomato";
        }
        gridColor = 'Tomato';
        break;
      case 'Yellow':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Yellow";
        }
        gridColor = 'Yellow';
        break;
      case 'Orange':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Orange";
        }
        gridColor = 'Orange';
        break;
      case 'PeachPuff':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "PeachPuff";
        }
        gridColor = 'PeachPuff';
        break;
      case 'Gold':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Gold";
        }
        gridColor = 'Gold';
        break;
      case 'Goldenrod':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Goldenrod";
        }
        gridColor = 'Goldenrod';
        break;
      case 'Lime':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Lime";
        }
        gridColor = 'Lime';
        break;
      case 'MediumAquamarine':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "MediumAquamarine";
        }
        gridColor = 'MediumAquamarine';
        break;
      case 'Aqua':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Aqua";
        }
        gridColor = 'Aqua';
        break;
      case 'Aquamarine':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Aquamarine";
        }
        gridColor = 'Aquamarine';
        break;
      case 'MediumTurquoise':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "MediumTurquoise";
        }
        gridColor = 'MediumTurquoise';
        break;
      case 'SkyBlue':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "SkyBlue";
        }
        gridColor = 'SkyBlue';
        break;
      case 'DeepSkyBlue':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "DeepSkyBlue";
        }
        gridColor = 'DeepSkyBlue';
        break;
      case 'Violet':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Violet";
        }
        gridColor = 'Violet';
        break;
      case 'Magenta':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Magenta";
        }
        gridColor = 'Magenta';
        break;
      case 'Azure':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "Azure";
        }
        gridColor = 'Azure';
        break;
      case 'LavenderBlush':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "LavenderBlush";
        }
        gridColor = 'LavenderBlush';
        break;
      case 'LightGray':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "LightGray";
        }
        gridColor = 'LightGray';
        break;
      case 'SlateGray':
        list = document.getElementsByClassName("gridCell");
        for (index = 0; index < list.length; ++index)
        {
          list[index].style.backgroundColor = "SlateGray";
        }
        gridColor = 'SlateGray';
        break;
    }
}

function changeP1Color(p1ColorInput)  // function to change player one's piece color
{
  if (gridColor == p1ColorInput)
  {
    choice = confirm("Your choice of color for player ❌ is the same as the current background. Do you still want to go through with the current selection?");
    if (!choice)
    {
      return;
    }
  }
  switch (p1ColorInput)
  {
    case 'DeepPink':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "DeepPink";
      }
      player1Color = 'DeepPink';
      break;
    case 'LightSalmon':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LightSalmon";
      }
      player1Color = 'LightSalmon';
      break;
    case 'Salmon':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Salmon";
      }
      player1Color = 'Salmon';
      break;
    case 'LightCoral':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LightCoral";
      }
      player1Color = 'LightCoral';
      break;
    case 'Crimson':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Crimson";
      }
      player1Color = 'Crimson';
      break;
    case 'OrangeRed':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "OrangeRed";
      }
      player1Color = 'OrangeRed';
      break;
    case 'Tomato':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Tomato";
      }
      player1Color = 'Tomato';
      break;
    case 'Yellow':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Yellow";
      }
      player1Color = 'Yellow';
      break;
    case 'Orange':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Orange";
      }
      player1Color = 'Orange';
      break;
    case 'PeachPuff':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "PeachPuff";
      }
      player1Color = 'PeachPuff';
      break;
    case 'Gold':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Gold";
      }
      player1Color = 'Gold';
      break;
    case 'Goldenrod':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Goldenrod";
      }
      player1Color = 'Goldenrod';
      break;
    case 'Lime':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Lime";
      }
      player1Color = 'Lime';
      break;
    case 'MediumAquamarine':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "MediumAquamarine";
      }
      player1Color = 'MediumAquamarine';
      break;
    case 'Aqua':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Aqua";
      }
      player1Color = 'Aqua';
      break;
    case 'Aquamarine':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Aquamarine";
      }
      player1Color = 'Aquamarine';
      break;
    case 'MediumTurquoise':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "MediumTurquoise";
      }
      player1Color = 'MediumTurquoise';
      break;
    case 'SkyBlue':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "SkyBlue";
      }
      player1Color = 'SkyBlue';
      break;
    case 'DeepSkyBlue':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "DeepSkyBlue";
      }
      player1Color = 'DeepSkyBlue';
      break;
    case 'Violet':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Violet";
      }
      player1Color = 'Violet';
      break;
    case 'Magenta':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Magenta";
      }
      player1Color = 'Magenta';
      break;
    case 'Azure':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Azure";
      }
      player1Color = 'Azure';
      break;
    case 'LavenderBlush':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LavenderBlush";
      }
      player1Color = 'LavenderBlush';
      break;
    case 'LightGray':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LightGray";
      }
      player1Color = 'LightGray';
      break;
    case 'SlateGray':
      list = document.getElementsByClassName("player1");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "SlateGray";
      }
      player1Color = 'SlateGray';
      break;
  }
}

function changeP2Color(p2ColorInput)  // function to change player two's piece color
{
  if (gridColor == p2ColorInput)
  {
    choice = confirm("Your choice of color for player ⭕️ is the same as the current background. Do you still want to go through with the current selection?");
    if (!choice)
    {
      return;
    }
  }
  switch (p2ColorInput)
  {
    case 'DeepPink':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "DeepPink";
      }
      player2Color = 'DeepPink';
      break;
    case 'LightSalmon':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LightSalmon";
      }
      player2Color = 'LightSalmon';
      break;
    case 'Salmon':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Salmon";
      }
      player2Color = 'Salmon';
      break;
    case 'LightCoral':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LightCoral";
      }
      player2Color = 'LightCoral';
      break;
    case 'Crimson':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Crimson";
      }
      player2Color = 'Crimson';
      break;
    case 'OrangeRed':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "OrangeRed";
      }
      player2Color = 'OrangeRed';
      break;
    case 'Tomato':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Tomato";
      }
      player2Color = 'Tomato';
      break;
    case 'Yellow':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Yellow";
      }
      player2Color = 'Yellow';
      break;
    case 'Orange':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Orange";
      }
      player2Color = 'Orange';
      break;
    case 'PeachPuff':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "PeachPuff";
      }
      player2Color = 'PeachPuff';
      break;
    case 'Gold':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Gold";
      }
      player2Color = 'Gold';
      break;
    case 'Goldenrod':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Goldenrod";
      }
      player2Color = 'Goldenrod';
      break;
    case 'Lime':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Lime";
      }
      player2Color = 'Lime';
      break;
    case 'MediumAquamarine':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "MediumAquamarine";
      }
      player2Color = 'MediumAquamarine';
      break;
    case 'Aqua':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Aqua";
      }
      player2Color = 'Aqua';
      break;
    case 'Aquamarine':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Aquamarine";
      }
      player2Color = 'Aquamarine';
      break;
    case 'MediumTurquoise':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "MediumTurquoise";
      }
      player2Color = 'MediumTurquoise';
      break;
    case 'SkyBlue':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "SkyBlue";
      }
      player2Color = 'SkyBlue';
      break;
    case 'DeepSkyBlue':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "DeepSkyBlue";
      }
      player2Color = 'DeepSkyBlue';
      break;
    case 'Violet':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Violet";
      }
      player2Color = 'Violet';
      break;
    case 'Magenta':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Magenta";
      }
      player2Color = 'Magenta';
      break;
    case 'Azure':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "Azure";
      }
      player2Color = 'Azure';
      break;
    case 'LavenderBlush':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LavenderBlush";
      }
      player2Color = 'LavenderBlush';
      break;
    case 'LightGray':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "LightGray";
      }
      player2Color = 'LightGray';
      break;
    case 'SlateGray':
      list = document.getElementsByClassName("player2");
      for (index = 0; index < list.length; ++index)
      {
        list[index].style.color = "SlateGray";
      }
      player2Color = 'SlateGray';
      break;
  }
}

function gridColorDropDown()
{
    document.getElementById("gridcolorDropdown").classList.toggle("show");
}

function navigationDropDown()
{
    document.getElementById("navigationDropdown").classList.toggle("show");
}

function playerOneColorDropDown()
{
    document.getElementById("p1colorDropdown").classList.toggle("show");
}

function playerTwoColorDropDown()
{
    document.getElementById("p2colorDropdown").classList.toggle("show");
}

function sizeDropDown()
{
    document.getElementById("sizeDropdown").classList.toggle("show");
}

function gameModeDropDown()
{
    document.getElementById("gameModeDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event)
{
  if (!event.target.matches(".dropdownButt"))
  {
    var dropdowns = document.getElementsByClassName("clickContent");
    var i;
    for (i = 0; i < dropdowns.length; i++)
    {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show"))
      {
        openDropdown.classList.remove("show");
      }
    }
  }
}
