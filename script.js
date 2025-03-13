document.addEventListener("DOMContentLoaded", () => {
  // Game variables
  let currentWord = ""
  let guessedLetters = []
  let wrongGuesses = 0
  let score = 0
  let gameStatus = "playing" // playing, won, lost
  let wordHint = ""
  const maxWrongGuesses = 6
  const vowels = ["A", "E", "I", "O", "U"]

  // DOM elements
  const wordContainer = document.getElementById("word-container")
  const keyboard = document.getElementById("keyboard")
  const scoreElement = document.getElementById("score")
  const remainingGuessesElement = document.getElementById("remaining-guesses")
  const gameOverElement = document.getElementById("game-over")
  const winMessageElement = document.getElementById("win-message")
  const loseMessageElement = document.getElementById("lose-message")
  const correctWordElement = document.getElementById("correct-word")
  const revealedWordElement = document.getElementById("revealed-word")
  const playAgainButton = document.getElementById("play-again")
  const newGameButton = document.getElementById("new-game")
  const hangmanParts = document.querySelectorAll(".hangman-part:not(.visible)")
  const hintContainer = document.getElementById("hint-container")
  const hintElement = document.getElementById("hint")

  // Word list with hints
  const wordList = [
    { word: "ADVENTURE", hint: "An exciting or unusual experience" },
    { word: "MOUNTAIN", hint: "A large natural elevation of the earth's surface" },
    { word: "RAINBOW", hint: "A meteorological phenomenon with colors in the sky" },
    { word: "ELEPHANT", hint: "A large mammal with a trunk" },
    { word: "BUTTERFLY", hint: "An insect with colorful wings" },
    { word: "CHOCOLATE", hint: "A sweet food made from cacao beans" },
    { word: "WATERFALL", hint: "Flowing water falling from a height" },
    { word: "UNIVERSE", hint: "All of space and time and their contents" },
    { word: "TREASURE", hint: "A quantity of precious metals, gems, or other valuables" },
    { word: "FESTIVAL", hint: "A day or period of celebration" },
    { word: "SYMPHONY", hint: "An elaborate musical composition" },
    { word: "PARADISE", hint: "A place of extreme beauty, delight, or happiness" },
    { word: "HURRICANE", hint: "A storm with a violent wind" },
    { word: "DINOSAUR", hint: "An extinct reptile from the Mesozoic era" },
    { word: "FIREWORKS", hint: "Explosive devices for display" },
    { word: "TELESCOPE", hint: "An optical instrument for viewing distant objects" },
  ]

  // Get a random word with hint
  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length)
    return wordList[randomIndex]
  }

  // Initialize the game
  const initGame = () => {
    // Reset game state
    guessedLetters = []
    wrongGuesses = 0
    gameStatus = "playing"

    // Get a random word with hint
    const wordData = getRandomWord()
    currentWord = wordData.word
    wordHint = wordData.hint

    console.log("Word to guess:", currentWord) // For debugging

    // Don't pre-mark vowels anymore
    // We'll mark them with X in the display instead

    // Update UI
    updateWordDisplay()
    createKeyboard()
    updateHangman()
    remainingGuessesElement.textContent = `Remaining guesses: ${maxWrongGuesses}`
    gameOverElement.classList.remove("show")
    hintContainer.classList.remove("show-hint")
    hintElement.textContent = "Play to reveal hint after 3 mistakes"
  }

  // Update the word display with current guesses
  const updateWordDisplay = () => {
    wordContainer.innerHTML = ""

    currentWord.split("").forEach((letter, index) => {
      const letterBox = document.createElement("div")
      letterBox.classList.add("letter-box")
      letterBox.style.animationDelay = `${index * 0.1}s`

      if (guessedLetters.includes(letter) || gameStatus === "lost") {
        // Show the letter if it's been guessed or game is lost
        letterBox.textContent = letter

        if (vowels.includes(letter)) {
          letterBox.classList.add("vowel")
        }

        if (gameStatus === "lost" && !guessedLetters.includes(letter)) {
          letterBox.style.color = "var(--incorrect)"
        }
      } else if (vowels.includes(letter)) {
        // Show X for vowels that haven't been guessed yet
        letterBox.textContent = "X"
        letterBox.classList.add("vowel-placeholder")
      }

      wordContainer.appendChild(letterBox)
    })
  }

  // Create the keyboard
  const createKeyboard = () => {
    keyboard.innerHTML = ""

    const rows = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M"],
    ]

    rows.forEach((row, rowIndex) => {
      const keyboardRow = document.createElement("div")
      keyboardRow.classList.add("keyboard-row")
      keyboardRow.style.marginLeft = `${rowIndex * 12}px`

      row.forEach((letter, letterIndex) => {
        const key = document.createElement("button")
        key.classList.add("key")
        key.textContent = letter
        key.style.animationDelay = `${(rowIndex * 10 + letterIndex) * 0.03}s`

        // Mark vowels in the keyboard
        if (vowels.includes(letter)) {
          key.classList.add("vowel-key")
        }

        if (guessedLetters.includes(letter)) {
          key.classList.add("disabled")

          if (currentWord.includes(letter)) {
            key.classList.add("correct")
          } else {
            key.classList.add("incorrect")
          }
        }

        key.addEventListener("click", () => handleGuess(letter))
        keyboardRow.appendChild(key)
      })

      keyboard.appendChild(keyboardRow)
    })
  }

  // Update the hangman drawing
  const updateHangman = () => {
    // The first 4 parts (base, pole, top bar, rope) are already visible
    // We only need to update the body parts starting from index 0 (head)
    hangmanParts.forEach((part, index) => {
      if (index < wrongGuesses) {
        part.style.opacity = "1"
      } else {
        part.style.opacity = "0"
      }
    })
  }

  // Show hint after 3 wrong guesses
  const showHint = () => {
    hintElement.textContent = wordHint
    hintContainer.classList.add("show-hint")
  }

  // Handle letter guess
  const handleGuess = (letter) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return

    guessedLetters.push(letter)

    if (!currentWord.includes(letter)) {
      wrongGuesses++
      remainingGuessesElement.textContent = `Remaining guesses: ${maxWrongGuesses - wrongGuesses}`

      // Show hint after 3 wrong guesses
      if (wrongGuesses === 3) {
        showHint()
      }

      if (wrongGuesses >= maxWrongGuesses) {
        gameStatus = "lost"
        endGame()
      }
    } else {
      // Check if player has won
      const isWon = currentWord.split("").every((letter) => guessedLetters.includes(letter))

      if (isWon) {
        gameStatus = "won"
        score++
        scoreElement.textContent = score
        endGame()
      }
    }

    updateWordDisplay()
    createKeyboard()
    updateHangman()
  }

  // End the game
  const endGame = () => {
    if (gameStatus === "won") {
      winMessageElement.style.display = "block"
      loseMessageElement.style.display = "none"
      correctWordElement.textContent = currentWord
    } else {
      winMessageElement.style.display = "none"
      loseMessageElement.style.display = "block"
      revealedWordElement.textContent = currentWord
    }

    gameOverElement.classList.add("show")
  }

  // Event listeners
  playAgainButton.addEventListener("click", initGame)
  newGameButton.addEventListener("click", initGame)

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (gameStatus === "playing") {
      const key = e.key.toUpperCase()
      if (/^[A-Z]$/.test(key) && !guessedLetters.includes(key)) {
        handleGuess(key)
      }
    }
  })

  // Initialize the game on load
  initGame()

  // Add animation to the title
  const title = document.querySelector(".title")
  title.addEventListener("mouseover", () => {
    document.querySelectorAll(".sparkle").forEach((sparkle) => {
      sparkle.style.animation = "none"
      setTimeout(() => {
        sparkle.style.animation = "sparkle 2s infinite"
      }, 10)
    })
  })
})

