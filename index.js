const kijiji = require("kijiji-scraper")
const express = require('express')
const app = express()
var http = require('http');
const server = http.createServer(app)
var fs = require('fs'); // to get data from html file

const {
    Server
} = require("socket.io");
const io = new Server(server);

const {
    readFileSync,
    promises: fsPromises
} = require('fs');

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html", console.log(__dirname + "/index.html"));
});

io.on('connection', (socket) => {

    socket.on('new topic', () => {

    });

    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log("a user disconnected")
    });
    socket.on('search', (category, location) => {
        console.log('message:', category, location);
    });
    socket.on('search', (category, location, min, kwrds) => {
        let params, options
        if (kwrds != '') {
            params = {
                locationId: parseInt(location),
                categoryId: parseInt(category),
                keywords: kwrds,

            };
            options = {
                minResults: parseInt(min),
                scraperType: "html",
            };
        } else {
            params = {
                locationId: parseInt(location),
                categoryId: parseInt(category),

            };
            options = {
                minResults: parseInt(min),
            };
        }
        console.log("PARAMS ARE:", params)

        kijiji.search(params, options, callback).then(ads => {
            io.to(socket.id).emit('search results', {
                ads: ads,
                status: 'valid'
            });
            console.log(ads)
            ads = []
        }).catch(function (e) {
            console.log(e);
            io.to(socket.id).emit('search results', {
                ads: [],
                status: 'error'
            });
            console.log("\n\n\nSTATUS IS", 'error');
        });


    });

    function callback(err, ads) {
        if (!err) {
            // Use the ads array
            if (ads.length == 0) {
                io.to(socket.id).emit('search results', {
                    ads: ads,
                    status: 'valid'
                });
                console.log("No Results Found.")
            }
        }
    }
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});


// const params = {
//     locationId: 1700272, // Greater Toronto Area
//     categoryId: 110, // Same as kijiji.categories.TOOLS
//     sortByName: "priceAsc" // Show the cheapest listings first
// };

// Scrape using returned promise
// kijiji.search(params, options).then(ads => {
//     // Use the ads array
//     for (let i = 0; i < ads.length; ++i) {
//         //console.log(ads[i].title);
//     }
// }).catch(console.error);