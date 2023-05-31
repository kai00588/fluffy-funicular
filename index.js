const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const axios= require('axios');
const port = process.env.PORT || 3000;

const app = express();
const url = "https://gogoanime.cl";


let animes = [];
let SinglePage = null;
const fetchData = async (pageNumber)=> {
    let local_url = `${url}?page=${pageNumber}`;
    await axios.get(local_url).then((res) => {
        const $ = cheerio.load(res.data);
        const lists = $('ul.items li');
        lists.map((index,item)=>{
            let title = $(item).find('p.name a').attr('title');
            let page_link = $(item).find('p.name a').attr('href')
            let episode = $(item).find('p.episode').text();
            let image = $(item).find('div.img a img').attr('src');
            let anime = {
                title: title,
                page_link: `${url}${page_link}`,
                episode: episode,
                image: image,
            }
            animes.push(anime);
        })
    });
}
const fetchSinglInfo = async (link) => {
    let local_url = `${url}/${link}`;
    await axios.get(local_url).then((res)=>{
        const $ = cheerio.load(res.data);
        let mainbody = $('div.main_body');
        let single_title = $(mainbody).find('div.anime_video_body h1').text().split('gogo')[0];
        let catagory = $(mainbody).find('div.anime_video_body_cate a').attr('title');
        let original_title = $(mainbody).find('div.anime-info a').attr('title');
        let video_url = $(mainbody).find('div.anime_video_body_watch_items div.play-video iframe').attr('src');
        SinglePage = {
            single_title: single_title,
            type: catagory,
            original_title: original_title,
            video_url: video_url
        };
        // console.log(related_episodes);
    })
}



app.use(cors());

app.get('/',(req,res)=>{
    res.json({data: 'no-data'})
})
app.get('/recent/:pageNumber',async (req,res)=>{
    let pageNumber = req.params.pageNumber;
    await fetchData(pageNumber);
    res.json({current_page: pageNumber,data: animes})
})
app.get('/:link',async (req,res)=>{
    await fetchSinglInfo(req.params.link);
    res.json({data: SinglePage});
})


app.listen(port,()=>{
    console.log(`[SERVER]::server running on port ${port}`);
});