$(document).ready(() => {
    function getJoke() {
        $(document).load("https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=twopart", (response) => {
            joke = JSON.parse(response);
            $("#joke").html(`${joke.setup} <br> ${joke.delivery}`);
        });
    }

    $(document).load("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02", (response) => {
        items = JSON.parse(response);
        console.log(items.features)
        for(let i = 0; i < 10; i++) {
            console.log(items.features[i].properties.title)
                const tickerItem = $("<a class='ticker-item'></a>").text(items.features[i].properties.title + " has a magnitude of " + items.features[i].properties.mag + " magnitude");
                tickerItem.attr("href", items.features[i].properties.url);
                tickerItem.attr("target", "_blank");
                console.log(Number.parseFloat(items.features[i].properties.mag));
                if (Number.parseFloat(items.features[i].properties.mag) > 2.0) {
                    tickerItem.css("background-color", "red");
                }
                $("#ticker-transition").append(tickerItem);
        }
    });

    $(document).load("http://api.open-notify.org/iss-now.json", (response) => {
        console.log(response.latitude)
        console.log(response.longitude)
        $("#iss-location").text(`Tracking ISS Space Station:    Lat:${response.latitude}, Lon:${response.longitude}`);
    });

    $(document).load("https://api.chucknorris.io/jokes/random", (response) => {
        const joke = JSON.parse(response).value;
        $("#norris").text(joke);
    });

    $(document).load("https://api.coincap.io/v2/assets", (response) => {
        const data = JSON.parse(response).data;

        for(i = 0; i < 30; i++) {
            const coin = data[i].symbol;
            const price = Number.parseFloat(data[i].priceUsd).toFixed(2);
            const isDown = data[i].changePercent24Hr.charAt(0) == '-';
            let item;
            if (isDown) {
                item = $("<li class='isDown'></li>").html(`${coin} : ${price} &#9660`)
            }
            else {
                item = item = $("<li class='isUp'></li>").html(`${coin} : ${price} &#9650;`)
            }

            $("#crypto").append(item);
        }
    });

    $("#joke-button").on("click", () => {
        getJoke();
    });
});