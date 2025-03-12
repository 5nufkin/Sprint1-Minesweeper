'use strict'


function getRandCell() {
  var isValid = false
  const randPos = {}
  while (!isValid) {
    randPos.i = getRandomInt(0, gLevel.SIZE),
      randPos.j = getRandomInt(0, gLevel.SIZE)
    if (!gBoard[randPos.i][randPos.j].isMine && !gBoard[randPos.i][randPos.j].firstClicked) return randPos
  }
}

function getCellLocation(elCell) {
  const cell = {}
  var location = (elCell.classList[1].split('-'))
  cell.i = +location[1]
  cell.j = +location[2]
  return cell
}

function getCurrCell(elCell) {
  const cellLocation = {}
  var location = (elCell.classList[1].split('-'))
  cellLocation.i = +location[1]
  cellLocation.j = +location[2]
  const currCell = gBoard[cellLocation.i][cellLocation.j]
  return currCell
}

function countMineNegs(rowIdx, colIdx, isRevealNegs) { 
  var mineNegsCount = 0
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > gBoard[i].length - 1) continue
      if (i === rowIdx && j === colIdx) continue
      const currCell = gBoard[i][j]
      if (currCell.isMine && !isRevealNegs) mineNegsCount++ 
      else if (isRevealNegs && !currCell.isMine) {
        debugger
          //Model
          currCell.isCovered = false
          gGame.revealedCount++
          //DOM
          const elCell = document.querySelector(`.cell-${i}-${j} span`)
          elCell.classList.remove('covered')
        } 
      }
    }
    return mineNegsCount
  }






function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function makeId(length = 6) {
  var txt = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
      txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return txt
}

function getRandomColor() {
const letters = '0123456789ABCDEF'
var color = '#'

for (var i = 0; i < 6; i++) {
  color += letters[Math.floor(Math.random() * 16)]
}
return color
}

function createMat(ROWS, COLS) {
  const mat = []
  for (var i = 0; i < ROWS; i++) {
      const row = []
      for (var j = 0; j < COLS; j++) {
          row.push('')
      }
      mat.push(row)
  }
  return mat
}

function copyMat(mat) {
  var newMat = []
  for (var i = 0; i < mat.length; i++) {
      newMat[i] = []
      for (var j = 0; j < mat[0].length; j++) {
          newMat[i][j] = mat[i][j]
      }
  }
  return newMat
}

//Neighbors Loop Reference 
function blowUpNegs(rowIdx, colIdx) {
  // console.log('rowIdx,colIdx:', rowIdx, colIdx)

  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > gBoard.length - 1) continue
      for (var j = colIdx - 1; j <= colIdx + 1; j++) {
          if (j < 0 || j > gBoard[0].length - 1) continue
          if (i === rowIdx && j === colIdx) continue
          var cell = gBoard[i][j]
          // console.log('cell:', cell)
          if (cell === LIFE) {
              // console.log('i,j:', i, j)

              // UPDATE THE MODEL
              gBoard[i][j] = ''

              // UPDATE THE DOM
              var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
              // console.log('elCell:', elCell)
              elCell.innerText = ''
              elCell.classList.remove('occupied')
          }
      }
  }
}