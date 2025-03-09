document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const getStartedBtn = document.getElementById("get-started-btn")
  const inputSection = document.getElementById("input-section")
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const uploadArea = document.getElementById("upload-area")
  const fileInput = document.getElementById("file-input")
  const fileList = document.getElementById("file-list")
  const linkInput = document.getElementById("link-input")
  const addLinkBtn = document.getElementById("add-link-btn")
  const linkList = document.getElementById("link-list")
  const generateBtn = document.getElementById("generate-btn")
  const processingSection = document.getElementById("processing-section")
  const flashcardSection = document.getElementById("flashcard-section")
  const prevCardBtn = document.getElementById("prev-card-btn")
  const nextCardBtn = document.getElementById("next-card-btn")
  const cardCounter = document.getElementById("card-counter")
  const currentFlashcard = document.getElementById("current-flashcard")
  const questionText = document.getElementById("question-text")
  const answerText = document.getElementById("answer-text")
  const flipCardBtn = document.getElementById("flip-card-btn")
  const newSetBtn = document.getElementById("new-set-btn")
  const processingStatus = document.getElementById("processing-status")

  // State
  let files = []
  let links = []
  let flashcards = []
  let currentCardIndex = 0

  // Event Listeners
  getStartedBtn.addEventListener("click", () => {
    inputSection.scrollIntoView({ behavior: "smooth" })
  })

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))

      btn.classList.add("active")
      document.getElementById(btn.dataset.tab).classList.add("active")
    })
  })

  // File upload handling
  uploadArea.addEventListener("click", () => {
    fileInput.click()
  })

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault()
    uploadArea.style.borderColor = "var(--primary-color)"
  })

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.style.borderColor = "var(--border-color)"
  })

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault()
    uploadArea.style.borderColor = "var(--border-color)"

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  })

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files)
    }
  })

  // Link handling
  addLinkBtn.addEventListener("click", addLink)
  linkInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addLink()
    }
  })

  // Generate flashcards
  generateBtn.addEventListener("click", generateFlashcards)

  // Flashcard navigation
  prevCardBtn.addEventListener("click", showPreviousCard)
  nextCardBtn.addEventListener("click", showNextCard)
  flipCardBtn.addEventListener("click", flipCard)
  newSetBtn.addEventListener("click", resetApp)

  // Functions
  function handleFiles(fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileType = getFileType(file.name)

      if (isValidFileType(fileType)) {
        files.push(file)
        addFileToList(file)
        updateGenerateButton()
      } else {
        alert("Unsupported file type. Please upload PDF, PPT, or TXT files.")
      }
    }
  }

  function getFileType(fileName) {
    return fileName.split(".").pop().toLowerCase()
  }

  function isValidFileType(fileType) {
    return ["pdf", "ppt", "pptx", "txt"].includes(fileType)
  }

  function addFileToList(file) {
    const fileItem = document.createElement("div")
    fileItem.className = "file-item"

    const fileType = getFileType(file.name)
    const fileIcon = getFileIcon(fileType)

    fileItem.innerHTML = `
            <div class="file-info">
                <img src="${fileIcon}" alt="${fileType} icon" class="file-icon">
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-type">${formatFileSize(file.size)} - ${fileType.toUpperCase()}</div>
                </div>
            </div>
            <button class="remove-btn" data-filename="${file.name}">Remove</button>
        `

    fileList.appendChild(fileItem)

    // Add remove event listener
    fileItem.querySelector(".remove-btn").addEventListener("click", function () {
      const fileName = this.dataset.filename
      removeFile(fileName)
      fileItem.remove()
    })
  }

  function getFileIcon(fileType) {
    // In a real app, you'd use actual icons
    return `https://placeholder.svg?height=24&width=24`
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  function removeFile(fileName) {
    files = files.filter((file) => file.name !== fileName)
    updateGenerateButton()
  }

  function addLink() {
    const url = linkInput.value.trim()

    if (url && isValidUrl(url)) {
      if (!links.includes(url)) {
        links.push(url)
        addLinkToList(url)
        updateGenerateButton()
        linkInput.value = ""
      } else {
        alert("This link has already been added.")
      }
    } else {
      alert("Please enter a valid YouTube or Wikipedia URL.")
    }
  }

  function isValidUrl(url) {
    try {
      const parsedUrl = new URL(url)
      return (
        parsedUrl.hostname.includes("youtube.com") ||
        parsedUrl.hostname.includes("youtu.be") ||
        parsedUrl.hostname.includes("wikipedia.org")
      )
    } catch (e) {
      return false
    }
  }

  function addLinkToList(url) {
    const linkItem = document.createElement("div")
    linkItem.className = "link-item"

    const linkSource = getLinkSource(url)
    const linkTitle = getLinkTitle(url, linkSource)
    const linkIcon = getLinkIcon(linkSource)

    linkItem.innerHTML = `
            <div class="link-info">
                <img src="${linkIcon}" alt="${linkSource} icon" class="link-icon">
                <div>
                    <div class="link-title">${linkTitle}</div>
                    <div class="link-source">${linkSource}</div>
                </div>
            </div>
            <button class="remove-btn" data-url="${url}">Remove</button>
        `

    linkList.appendChild(linkItem)

    // Add remove event listener
    linkItem.querySelector(".remove-btn").addEventListener("click", function () {
      const linkUrl = this.dataset.url
      removeLink(linkUrl)
      linkItem.remove()
    })
  }

  function getLinkSource(url) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "YouTube"
    } else if (url.includes("wikipedia.org")) {
      return "Wikipedia"
    }
    return "Website"
  }

  function getLinkTitle(url, source) {
    // In a real app, you'd fetch the actual title
    if (source === "YouTube") {
      return "YouTube Video"
    } else if (source === "Wikipedia") {
      return "Wikipedia Article"
    }
    return "Web Page"
  }

  function getLinkIcon(source) {
    // In a real app, you'd use actual icons
    return `https://placeholder.svg?height=24&width=24`
  }

  function getSocialIcon(platform) {
    // In a real app, you'd use actual social media icons
    if (platform === "LinkedIn") {
      return `https://placeholder.svg?height=24&width=24&text=in`
    } else if (platform === "Instagram") {
      return `https://placeholder.svg?height=24&width=24&text=ig`
    } else if (platform === "GitHub") {
      return `https://placeholder.svg?height=24&width=24&text=gh`
    }
    return `https://placeholder.svg?height=24&width=24`
  }

  function removeLink(url) {
    links = links.filter((link) => link !== url)
    updateGenerateButton()
  }

  function updateGenerateButton() {
    generateBtn.disabled = files.length === 0 && links.length === 0
  }

  function generateFlashcards() {
    // Show processing section
    inputSection.classList.add("hidden")
    processingSection.classList.remove("hidden")

    // Simulate processing time
    let progress = 0
    const processingInterval = setInterval(() => {
      progress += 10

      if (progress <= 30) {
        processingStatus.textContent = "Analyzing content..."
      } else if (progress <= 60) {
        processingStatus.textContent = "Identifying key concepts..."
      } else if (progress <= 90) {
        processingStatus.textContent = "Generating flashcards..."
      } else {
        processingStatus.textContent = "Finalizing your flashcards..."
      }

      if (progress >= 100) {
        clearInterval(processingInterval)
        processContent()
      }
    }, 500)
  }

  async function processContent() {
    flashcards = []

    // Process text files
    for (const file of files) {
      if (getFileType(file.name) === "txt") {
        try {
          const text = await readFileAsText(file)
          const cards = generateFlashcardsFromText(text)
          flashcards = [...flashcards, ...cards]
        } catch (error) {
          console.error("Error reading file:", error)
        }
      } else {
        // For non-text files (PDF, PPT), generate placeholder flashcards
        // In a real app, you'd use proper libraries to extract content
        const fileType = getFileType(file.name)
        const placeholderCards = generatePlaceholderFlashcards(file.name, fileType)
        flashcards = [...flashcards, ...placeholderCards]
      }
    }

    // Process links
    for (const link of links) {
      const linkSource = getLinkSource(link)
      const placeholderCards = generatePlaceholderFlashcards(link, linkSource)
      flashcards = [...flashcards, ...placeholderCards]
    }

    // Show flashcards
    showFlashcards()
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  function generateFlashcardsFromText(text) {
    const cards = []
    const paragraphs = text.split(/\n\s*\n/) // Split by empty lines

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim()
      if (paragraph.length > 10) {
        // Only process non-empty paragraphs
        // Generate a question from the paragraph
        const sentences = paragraph.split(/[.!?]+/).filter((s) => s.trim().length > 0)

        if (sentences.length > 0) {
          // Create a question from the first sentence
          const firstSentence = sentences[0].trim()
          const question = createQuestionFromSentence(firstSentence)

          // Use the rest of the paragraph as the answer
          const answer = paragraph

          cards.push({ question, answer })
        }
      }
    }

    return cards
  }

  function createQuestionFromSentence(sentence) {
    // Simple question generation logic
    // In a real app, you'd use NLP techniques for better questions

    // Remove punctuation and split into words
    const words = sentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/)

    if (words.length < 3) return `What is meant by "${sentence}"?`

    // Check if the sentence starts with common patterns
    if (/^(The|A|An|In|On|At|When|Where|Why|How|What|Who)\b/i.test(sentence)) {
      // Convert statement to question by moving the first word to the end
      const firstWord = words[0]
      if (/^(The|A|An|In|On|At)\b/i.test(firstWord)) {
        return `What ${words.slice(1).join(" ")} ${firstWord.toLowerCase()}?`
      }
    }

    // Find important nouns or concepts (simplified)
    const keyTerms = words.filter((word) => word.length > 5)

    if (keyTerms.length > 0) {
      const keyTerm = keyTerms[Math.floor(Math.random() * keyTerms.length)]
      return `What is the significance of ${keyTerm} in this context?`
    }

    // Fallback question
    return `What is the main idea expressed in "${sentence.substring(0, 30)}..."?`
  }

  function generatePlaceholderFlashcards(source, type) {
    const cards = []
    const count = 3 + Math.floor(Math.random() * 5) // Generate 3-7 cards

    for (let i = 0; i < count; i++) {
      let question, answer

      if (type === "YouTube") {
        question = `What is the key point discussed at ${Math.floor(Math.random() * 10) + 1}:${Math.floor(
          Math.random() * 60,
        )
          .toString()
          .padStart(2, "0")} in the video?`
        answer = `The video explains the concept of ${getRandomConcept()} and how it relates to ${getRandomConcept()}.`
      } else if (type === "Wikipedia") {
        question = `What is ${getRandomConcept()} according to the Wikipedia article?`
        answer = `${getRandomConcept()} is defined as a ${getRandomDefinition()}. It's important because it ${getRandomImportance()}.`
      } else if (type === "pdf" || type === "ppt" || type === "pptx") {
        question = `What does the ${type.toUpperCase()} document explain about ${getRandomConcept()}?`
        answer = `The document explains that ${getRandomConcept()} is ${getRandomDefinition()} and it's used for ${getRandomUsage()}.`
      } else {
        question = `What is the main concept discussed in this content?`
        answer = `The main concept is ${getRandomConcept()}, which is ${getRandomDefinition()}.`
      }

      cards.push({ question, answer })
    }

    return cards
  }

  function getRandomConcept() {
    const concepts = [
      "machine learning",
      "data analysis",
      "quantum computing",
      "artificial intelligence",
      "neural networks",
      "deep learning",
      "blockchain technology",
      "cloud computing",
      "internet of things",
      "cybersecurity",
      "data privacy",
      "augmented reality",
      "virtual reality",
      "sustainable development",
      "renewable energy",
      "climate change",
      "genetic engineering",
      "nanotechnology",
    ]
    return concepts[Math.floor(Math.random() * concepts.length)]
  }

  function getRandomDefinition() {
    const definitions = [
      "systematic approach to problem-solving",
      "revolutionary technology that transforms industries",
      "framework for understanding complex systems",
      "methodology for optimizing processes",
      "paradigm shift in how we approach challenges",
      "innovative solution to longstanding problems",
      "fundamental concept in modern science",
      "critical component of future technologies",
    ]
    return definitions[Math.floor(Math.random() * definitions.length)]
  }

  function getRandomImportance() {
    const importances = [
      "forms the foundation of modern technological advancements",
      "enables unprecedented efficiency in various processes",
      "revolutionizes how we interact with information",
      "provides solutions to previously unsolvable problems",
      "creates new opportunities for innovation and growth",
      "addresses critical challenges facing society today",
      "transforms our understanding of fundamental principles",
    ]
    return importances[Math.floor(Math.random() * importances.length)]
  }

  function getRandomUsage() {
    const usages = [
      "optimizing business processes",
      "enhancing decision-making capabilities",
      "improving user experiences",
      "solving complex computational problems",
      "automating repetitive tasks",
      "analyzing large datasets",
      "predicting future trends and patterns",
      "securing sensitive information",
    ]
    return usages[Math.floor(Math.random() * usages.length)]
  }

  function showFlashcards() {
    if (flashcards.length === 0) {
      // Handle case where no flashcards were generated
      processingStatus.textContent = "No content could be processed. Please try different files or links."
      return
    }

    // Hide processing section and show flashcard section
    processingSection.classList.add("hidden")
    flashcardSection.classList.remove("hidden")

    // Reset to first card
    currentCardIndex = 0
    updateFlashcardDisplay()
  }

  function updateFlashcardDisplay() {
    const card = flashcards[currentCardIndex]

    // Update question and answer text
    questionText.textContent = card.question
    answerText.textContent = card.answer

    // Update card counter
    cardCounter.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`

    // Reset card flip
    currentFlashcard.classList.remove("flipped")

    // Update navigation buttons
    prevCardBtn.disabled = currentCardIndex === 0
    nextCardBtn.disabled = currentCardIndex === flashcards.length - 1
  }

  function showPreviousCard() {
    if (currentCardIndex > 0) {
      currentCardIndex--
      updateFlashcardDisplay()
    }
  }

  function showNextCard() {
    if (currentCardIndex < flashcards.length - 1) {
      currentCardIndex++
      updateFlashcardDisplay()
    }
  }

  function flipCard() {
    currentFlashcard.classList.toggle("flipped")
  }

  function resetApp() {
    // Reset state
    files = []
    links = []
    flashcards = []

    // Clear UI
    fileList.innerHTML = ""
    linkList.innerHTML = ""
    linkInput.value = ""

    // Update button state
    updateGenerateButton()

    // Show input section, hide others
    flashcardSection.classList.add("hidden")
    processingSection.classList.add("hidden")
    inputSection.classList.remove("hidden")

    // Reset to first tab
    tabBtns[0].click()
  }
})

