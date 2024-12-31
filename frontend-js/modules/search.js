import axios from "axios"
import DOMPurify from 'dompurify'
export default class Search {
    // 1. Select DOM elements, and keep track of any useful data
    constructor() {
      this.injectHTML()
      this.headerSearchIcon = document.querySelector(".header-search-icon")
      this.overlay = document.querySelector(".search-overlay")
      this.closeIcon = document.querySelector(".close-live-search")
      this.inputField = document.querySelector("#live-search-field")
      this.resultsArea =document.querySelector(".live-search-results")
      this.loaderIcon = document.querySelector(".circle-loader")
      this.typingWaitTimer
      this.previousValue = ""
      this.events()
    }
  
    // 2. Events
    events() {
        this.inputField.addEventListener("keyup", () => this.keyPressHandler())
        this.closeIcon.addEventListener("click", () => this.closeOverlay())
        this.headerSearchIcon.addEventListener("click", (e) => {
          e.preventDefault()
          this.openOverlay()
        })
      }
  
    // 3. Methods
    keyPressHandler(){
        let value = this.inputField.value

        if(value == ""){
          clearTimeout(this.typingWaitTimer)
          this.hideLoaderIcon()
          this.hideResultsArea()
        }

        if(value != "" && value != this.previousValue){
            clearTimeout(this.typingWaitTimer)
            this.showLoaderIcon()
            this.hideResultsArea()
            this.typingWaitTimer = setTimeout(() => this.sendRequest(), 750)
        }

        this.previousValue = value

    }

    sendRequest(){
        axios.post('/search', {searchTerm: this.inputField.value}).then(response => {
          console.log(response.data)
          this.renderResultsHTML(response.data)
        }).catch(() => {
            alert("hi failure")
        })
    }

    renderResultsHTML(recipes){
      if(recipes.length){
        this.resultsArea.innerHTML = DOMPurify.sanitize(`<div class="list-group shadow-sm">
                    <div class="list-group-item active"><strong>Search Results</strong> (${recipes.length > 1 ? `${recipes.length} items found` : '1 item found'})</div>
                    ${recipes.map(recipe => {
                      let recipeDate = new Date(recipe.createdDate)
                      return `<a href="/recipe/${recipe._id}" class="list-group-item list-group-item-action">
                      <strong>${recipe.title}</strong>
                      <span class="text-muted small">by ${recipe.author.username} on ${recipeDate.getMonth() + 1}/${recipeDate.getDate()}/${recipeDate.getFullYear()}</span>
                    </a>`
                    }).join('')}
                  </div>` )
      }else{
        this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search.</p>`
            }
      this.hideLoaderIcon()
      this.showResultsArea()
    } 

    showLoaderIcon(){
        this.loaderIcon.classList.add("circle-loader--visible")
    }

    hideLoaderIcon(){
      this.loaderIcon.classList.remove("circle-loader--visible")
  }

    showResultsArea(){
      this.resultsArea.classList.add("live-search-results--visible")
    }

    hideResultsArea(){
      this.resultsArea.classList.remove("live-search-results--visible")
    }

    openOverlay() {
      this.overlay.classList.add("search-overlay--visible")
      setTimeout(() => this.inputField.focus(), 50)
    }
  
    closeOverlay() {
      this.overlay.classList.remove("search-overlay--visible")
    }
  
    injectHTML() {
        document.body.insertAdjacentHTML('beforeend', `
          <div class="search-overlay">
            <div class="search-overlay-top shadow-sm">
              <div class="container container--narrow">
                <label for="live-search-field" class="search-overlay-icon fas fa-camera fa-lg"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#0000FF" class="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
          </svg></label>
                <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
                <span class="close-live-search"><img src="/assets/x-circle.svg" width="32" alt="Search-icon"></span>
              </div>
            </div>
      
            <div class="search-overlay-bottom">
              <div class="container container--narrow py-3">
                <div class="circle-loader"></div>
                <div class="live-search-results "></div>
              </div>
            </div>
          </div>
        `);
    }
    
    
  }