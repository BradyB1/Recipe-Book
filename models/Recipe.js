const recipesCollection = require("../db").db().collection("recipes")
const ObjectId = require('mongodb').ObjectId
/*
Recipe CONTAINS the following attributes:
title: Recipe Title
Description: Recipe Description
Ingredients: Recipe Ingredients
Steps: Recipe Steps
cookTime: Cooking Time

*/


let Recipe = function(data, userid){
    this.data = data
    this.errors = []
    this.userid= userid
}

Recipe.prototype.cleanUp = function() {
    console.log("Incoming Data:", this.data)
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

    // get rid of any bogus properties
    this.data = {
        title: this.data.title.trim(),
        description: this.data.description.trim(),
        ingredients: this.data.ingredients,
        steps: this.data.steps,
        cook_time: this.data.cook_time.trim(),
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
            recipesCollection.insertOne(this.data).then(()=>{
                resolve()
            }).catch(()=>{
                this.errors.push("Please try again later. This is a server issue, not a user issue.")
                reject(this.errors)
            })
            
        }else{
            reject(this.errors)
        }
    })
}


Recipe.reusablePoseQuery = function (uniqueOperations) {
    return new Promise(async function(resolve, reject){
        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                title: 1,
                body: 1,
                createdDate: 1,
                author: {$arrayElemAt: ['$authorDocument', 0]}
            }}
        ])

        let recipes = await recipesCollection.aggregate(aggOperations).toArray()

        //clean up author property in each recipe object
        recipes = recipes.map(function(recipe){
            recipe.author = {
                username: recipe.author.username,
                //can add avatar later
            }

            return recipe
        })

        resolve(recipes)

    })
}


Recipe.findSingleById = function (id) {
    return new Promise(async function(resolve, reject){
        if (typeof(id) != "string" || !ObjectId.isValid(id)) {
            reject()
            return
        }
        
        let recipes = await Recipe.reusablePoseQuery([
            {$match: {_id: new ObjectId(id)}}
        ])

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

module.exports = Recipe