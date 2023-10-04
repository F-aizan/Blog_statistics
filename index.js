import express from 'express';
import lodash from 'lodash';
import fetch from 'node-fetch';


const app = express();
const port = 5500;

//fetch Api Data
let len = 0,res_title,uniq_titles,query_title;
const options = {
    method: 'GET',
    headers: {
      'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
    }
};

const fetch_blogs = async() => {
    let data;
    await fetch('https://intent-kit-16.hasura.app/api/rest/blogs/',options)
    .then(response => response.json())
    .then(response => {
      data = response.blogs
    })
    .catch((err) => console.error(err))
    return data
  }

let blogs = await fetch_blogs()

//Blog Analytics
const blog_length = lodash.size(blogs)

//Longest title
lodash.forEach(blogs,(val) => {
    if(val.title.length > len){
        len = val.title.length
        res_title = {
            'id':val.id,
            'image_url':val.image_url,
            'title':val.title
        }
    }
})

//Blog Titles containing the word privacy
lodash.filter(blogs,(val) => { 
    if(val.title.match(RegExp("[pP]rivacy")) != ""){
        query_title = val
        
    }
    else{
        query_title = {}
    }
})

//Blogs with unique titles
uniq_titles = lodash.uniqBy(blogs,'title');

//Route for displaying Blog Analytics Data
app.get('/api/blog-stats',(req,res) => {
    if(blogs == ""){
        res.send("Failed to Fetch Data from Api")
    }
    res.send({
        "Total Number of blogs":`${blog_length}`,
        "The title of the longest blog":{'id':res_title.id,'image_url':res_title.image_url,'title':res_title.title},
        "Number of blogs with 'privacy' in the title":`${lodash.filter(blogs,(val) => val.title.match(RegExp("[pP]rivacy"))).length}`,
        "Blogs with Unique titles":{
            '':Object.entries(uniq_titles).map((val) => val)
        }
    })
})


//Route for Diplaying Blogs on Search Parameter
app.get('/api/blog-search/',(req,res) => {
    let search = req.query.query,search_result;
    if(search == ""){
        res.send("Please Enter a valid Query")
    }
    search_result = lodash.filter(blogs,(val) => val.title.match(RegExp(search || (search[0].toUpperCase()+search.slice(1,search.length)))))
    res.send(
        {
            "Blog Titles Containing the Search Query":{
                "":search_result.map((val) => val)
            }
        }
    )
    
})


//Running our App on the localhost on given port
app.listen(port,() => {
    console.log(`Server started at ${port}`);
})

