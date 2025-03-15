'use strict'

function getRandCell() {
  // debugger
  if ((1 > (gLevel.SIZE ** 2 - gGame.revealedCount) - gLevel.MINES) && gFirstClick) return null
  var isValid = false
  const randPos = {}
  while (!isValid) {
    randPos.i = getRandomInt(0, gLevel.SIZE),
      randPos.j = getRandomInt(0, gLevel.SIZE)
    if (!gBoard[randPos.i][randPos.j].isMine && !gBoard[randPos.i][randPos.j].firstClicked && gBoard[randPos.i][randPos.j].isCovered) return randPos
  }
}

function greyOutElement(element) {
  element.classList.add('off')
}

function saveMove(cell, rowIdx, colIdx) {
  gLastMoves.unshift(createMoveObject(cell, rowIdx, colIdx))
}

function createMoveObject(cell, rowIdx, colIdx) {
  const move = {
    mIsOn: gGame.isOn,
    mLives: gGame.livesLeft,
    mRevealed: gGame.revealedCount,
    mMarked: gGame.markedCount,
    mCell: cell,
    mCellRowIdx: rowIdx,
    mCellColIdx: colIdx,
    mIsCoveredCell: cell.isCovered,
    mIsMarked: cell.isMarked,
    mMinesAround: gBoard[rowIdx][colIdx].minesAroundCount
  }
  return move
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

function countMineNegs(rowIdx, colIdx) {
  var mineNegsCount = 0
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > gBoard[i].length - 1) continue
      if (i === rowIdx && j === colIdx) continue
      const currCell = gBoard[i][j]
      if (currCell.isMine) {
        mineNegsCount++
      }
    }
  }
  return mineNegsCount
}

function getObjectByElement(elCell) {
  const cell = getCurrCell(elCell)
  return cell
}

function getElementByPos(rowIdx, colIdx) {
  const elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
  return elCell
}

// function expandReveal(board, elCell, rowIdx, colIdx) {
//   for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//     if (i < 0 || i > board.length - 1) continue

//     for (var j = colIdx - 1; j <= colIdx + 1; j++) {

//       if (j < 0 || j > board[i].length - 1) continue
//       if (i === rowIdx && j === colIdx) continue

//       const currCell = board[i][j]
//       if (!currCell.isMine && !currCell.isCovered) {
//         const elCellReveal = getElementByPos(i, j)
//         if (currCell.isCovered) continue
//         revealCell(elCellReveal)
//         if (currCell.minesAroundCount === 0 && !currCell.isMine) {
//           expandReveal(gBoard, elCell, i, j)
//           console.log('FIRST ONE')

//         }
//       }
//     }
//   }
// }

function expandReveal(board, elCell, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > board.length - 1) continue

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {

      if (j < 0 || j > board[i].length - 1) continue
      if (i === rowIdx && j === colIdx) continue

      const currCell = board[i][j]
      if (!currCell.isMine && currCell.isCovered) {
        const elCellReveal = getElementByPos(i, j)
        if (currCell.isMarked) continue
        revealCell(elCellReveal)
        if (currCell.minesAroundCount === 0 && !currCell.isMine) {
          expandReveal(gBoard, elCell, i, j)
        }
      }
    }
  }
}

// function collapseReveal(board, elCell, rowIdx, colIdx) {
//   for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//     if (i < 0 || i > board.length - 1) continue

//     for (var j = colIdx - 1; j <= colIdx + 1; j++) {

//       if (j < 0 || j > board[i].length - 1) continue
//       if (i === rowIdx && j === colIdx) continue

//       const currCell = board[i][j]
//       if (!currCell.isMine && !currCell.isCovered) {
//         const elCellReveal = getElementByPos(i, j)
//         if (currCell.isMarked) continue
//         unRevealCell(elCellReveal)
//         if (currCell.minesAroundCount === 0 && !currCell.isMine) {
//           collapseReveal(gBoard, elCell, i, j)
//         }
//       }
//     }
//   }
// }

function hintShowNegs(rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > gBoard[i].length - 1) continue

      const currCell = gBoard[i][j]
      if (currCell.isCovered && !currCell.isMarked) {
        const elCell = getElementByPos(i, j)
        revealCell(elCell)
      }
    }
  }
}

function getLevelName() {
  if (gLevel.SIZE === 4) return 'easy'
  if (gLevel.SIZE === 8) return 'medium'
  if (gLevel.SIZE === 12) return 'hard'
  return null
}

function getBestTime(level) {
  switch (level) {
    case 'easy':
      return localStorage.getItem('bestTimeEasy')
    case 'medium':
      return localStorage.getItem('bestTimeMedium')
    case 'hard':
      return localStorage.getItem('bestTimeHard')
    default:
      return null
  }
}

function setBestTime(level, newBestTime) {
  switch (level) {
    case 'easy':
      localStorage.setItem('bestTimeEasy', newBestTime)
      break
    case 'medium':
      localStorage.setItem('bestTimeMedium', newBestTime)
      break
    case 'hard':
      localStorage.setItem('bestTimeHard', newBestTime)
      break
    default:
      return null
  }
}



// function countMineNegs(rowIdx, colIdx, isRevealNegs) {
//   var mineNegsCount = 0
//   for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//     if (i < 0 || i > gBoard.length - 1) continue

//     for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//       if (j < 0 || j > gBoard[i].length - 1) continue
//       if (i === rowIdx && j === colIdx) continue

//       const currCell = gBoard[i][j]

//       // debugger
//       if (currCell.isMine && !isRevealNegs) mineNegsCount++

//       else if (isRevealNegs && !currCell.isMine) {
//         //Model
//         // console.log(currCell, currCell.isCovered)
//         currCell.isCovered = false
//         // console.log('\n1: i:', i, 'j:', j, 'gGame.revealedCount: ', gGame.revealedCount)
//         // console.log(gGame)
//         gGame.revealedCount++
//         // console.log('2: i:', i, 'j:', j, 'gGame.revealedCount: ', gGame.revealedCount)
//         //DOM
//         const elCell = document.querySelector(`.cell-${i}-${j}`)
//         console.log('\n', elCell)
//         if (currCell.isMarked) {
//           removeMark(elCell)
//           gGame.markedCount--
//           gGame.revealedCount--
//         }
//         console.log(elCell)
//         // console.log(elCell)
//         elCell.querySelector('span').classList.remove('covered')
//       }
//     }
//   }
//   if (!isRevealNegs) return mineNegsCount
// }






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