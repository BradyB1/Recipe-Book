const recipesCollection = require("../db").db().collection("recipes")
const ObjectId = require('mongodb').ObjectId
const sanitizeHTML = require('sanitize-html')
const followsCollection = require("../db").db().collection('follows')
/*
Recipe CONTAINS the following attributes:
title: Recipe Title
Description: Recipe Description
Ingredients: Recipe Ingredients
Steps: Recipe Steps
cookTime: Cooking Time

*/


let Recipe = function(data, userid, requestedPostId){
    this.data = data
    this.errors = []
    this.userid= userid
    this.requestedPostId = requestedPostId
}

Recipe.prototype.cleanUp = function() {
    // Validates that the attributes are all string values
    if(typeof(this.data.title) != "string"){
        this.data.title = ""
    }


    if(typeof(this.data.description) != "string"){
        this.data.description = ""
    }

    if(typeof(this.data.ingredients) != "string"){
        this.data.ingredients = ""
    }

    if(typeof(this.data.steps) != "string"){
        this.data.steps = ""
    }

    if(typeof(this.data.cook_time) != "string"){
        this.data.cook_time = ""
    }

    if(typeof(this.data.url) != "string"){
        this.data.url = ""
    }

    // get rid of any bogus properties
    this.data = {
        title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
        description: sanitizeHTML(this.data.description.replace(/\r?\n/g, '<br>').trim(), {allowedTags: ["br"], allowedAttributes: {}}),
        // ingredients: sanitizeHTML(this.data.ingredients, {allowedTags: ['br'], allowedAttributes: {}} ),
        ingredients: sanitizeHTML(this.data.ingredients.replace(/\r?\n/g, '<br>'), {allowedTags: ['br'], allowedAttributes: {}}),
        steps: sanitizeHTML(this.data.steps.replace(/\r?\n/g, '<br>'), {allowedTags: ["br"], allowedAttributes: {}} ),
        cook_time: sanitizeHTML(this.data.cook_time, {allowedTags: [], allowedAttributes: {}} ),
        url: sanitizeHTML(this.data.url, {allowedTags: [], allowedAttributes: {}}),
        createdDate: new Date(),
        author: new ObjectId(this.userid)
    };

}

Recipe.prototype.validate = function() {
    // Ensure Fields have values
    if(this.data.title == ""){
        this.errors.push("You must include a title")
    }
    if(this.data.description == ""){
        this.errors.push("You must include a Description")
    }

    if(this.data.ingredients == ""){
        this.errors.push("You must include ingredients")
    }

    if(this.data.steps == ""){
        this.errors.push("You must include a steps")
    }
    
    if(this.data.cook_time == ""){
        this.errors.push("You must include a cook time.")
    }

    

}

Recipe.prototype.create = function() {
    return new Promise((resolve, reject)=>{
        this.cleanUp()
        this.validate()
        if (!this.errors.length){
            // save recipe to db
            recipesCollection.insertOne(this.data).then((info)=>{
                resolve(info.insertedId)
            }).catch(()=>{
                this.errors.push("Please try again later. This is a server issue, not a user issue.")
                reject(this.errors)
            })
            
        }else{
            reject(this.errors)
        }
    })
}

Recipe.prototype.update = async function(){
    return new Promise(async (resolve, reject) => {
        try{
            let recipe = await Recipe.findSingleById(this.requestedPostId, this.userid)
            if(recipe.isVisitorOwner){
                //actually update db
                let status = await this.actuallyUpdate()
                resolve(status)
            }else{
                reject()
            }
        }catch{
            reject()
        }
    })
}

Recipe.prototype.actuallyUpdate = function(){
    return new Promise(async (resolve, reject) =>{
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            await recipesCollection.findOneAndUpdate({_id:new ObjectId(this.requestedPostId)}, {$set:{ title: this.data.title, description: this.data.description, ingredients: this.data.ingredients, steps: this.data.steps, cook_time: this.data.cook_time, url: this.data.url}})
            resolve("success")
        }else{
            resolve("failure")
        }
    })
}

Recipe.reusablePoseQuery = function (uniqueOperations, visitorId, finalOperations = []) {
    return new Promise(async function(resolve, reject){
        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                title: 1,
                description: 1,
                ingredients: 1,
                steps: 1,
                cook_time: 1,
                createdDate: 1,
                url: 1,
                authorId: "$author",
                author: {$arrayElemAt: ['$authorDocument', 0]}
            }}
        ]).concat(finalOperations)

        let recipes = await recipesCollection.aggregate(aggOperations).toArray()

        //clean up author property in each recipe object
        recipes = recipes.map(function(recipe){
            recipe.isVisitorOwner = recipe.authorId.equals(visitorId)
            recipe.authorId = undefined
            recipe.author = {
                username: recipe.author.username,
                //can add avatar later
            }

            return recipe
        })

        resolve(recipes)

    })
}


Recipe.findSingleById = function (id, visitorId) {
    return new Promise(async function(resolve, reject){
        if (typeof(id) != "string" || !ObjectId.isValid(id)) {
            reject()
            return
        }
        
        let recipes = await Recipe.reusablePoseQuery([
            {$match: {_id: new ObjectId(id)}}
        ], visitorId)
        console.log(`Find single recipe: ${recipes}`)
        if (recipes.length) {
            console.log(recipes[0])
            resolve(recipes[0])
        }else{
            reject()
        }

    })
}

Recipe.findByAuthorId = function(authorId){
    return Recipe.reusablePoseQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}}
    ])
}

Recipe.delete = function(recipeIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let recipe = await Recipe.findSingleById(recipeIdToDelete, currentUserId)
      if (recipe.isVisitorOwner) {
        await recipesCollection.deleteOne({_id: new ObjectId(recipeIdToDelete)})
        resolve()
      } else {
        reject()
      }    
    } catch {
      reject()
    }
  })
}

Recipe.search = function(searchTerm){
    return new Promise(async(resolve, reject) => {
        if(typeof(searchTerm) == "string"){
            let recipes = await Recipe.reusablePoseQuery([
                {$match: {$text: {$search: searchTerm}}}
            ], undefined, [{$sort: {score: {$meta: "textScore"}}}])
            resolve(recipes)
        }else{
            reject()
        }
    })
}

Recipe.countRecipesByAuthor = function(id){
    return new Promise(async (resolve, reject) =>{
        let recipeCount = await recipesCollection.countDocuments({author: id})
        resolve(recipeCount)
    })
}

Recipe.getFeed = async function(id){
    // create an array of the user ids that the current user follows
    let followedUsers = await followsCollection.find({authorId: new ObjectId(id)}).toArray()
    followedUsers = followedUsers.map(function(followDoc){
        return followDoc.followedId
    })
    // look for recipes where the author is in the above array of followed users
    return Recipe.reusablePoseQuery([
        {$match: {author: {$in: followedUsers}}},
        {$sort: {createdDate: -1}}
    ])
}

module.exports = Recipe