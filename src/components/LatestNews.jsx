import "../styles/latest-news.css";

const newsData = [
  {
    id: 1,
    title: "New direct flights connect Europe and Central Asia",
    description:
      "Several airlines announced new routes linking major European cities with destinations across Central Asia, making travel more accessible than ever. Among the carriers launching services are Lufthansa, Turkish Airlines and Air Astana, with connections from Frankfurt, Istanbul and Almaty to previously underserved cities like Samarkand, Bishkek and Dushanbe. Industry analysts predict a 40% increase in passenger traffic along these corridors by the end of 2026.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&q=80",
    time: "2 hrs ago",
    tag: "Travel",
    featured: true,
  },
  {
    id: 2,
    title: "Japan sees record tourism numbers in early 2026",
    description:
      "Visitor arrivals to Japan surpass expectations as cherry blossom season draws millions of travellers. The Japan National Tourism Organization reported 3.8 million visitors in March alone, a 25% jump compared to the same period last year. The weak yen continues to attract budget-conscious tourists, while new shinkansen routes to rural regions are helping to spread visitors beyond Tokyo and Kyoto.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80",
    time: "5 hrs ago",
    tag: "Asia",
  },
  {
    id: 3,
    title: "European rail passes now cover 35 countries",
    description:
      "Expanded coverage makes cross-border train travel easier for tourists exploring the continent. The updated Eurail network now includes routes through the Balkans and the Baltics, with Montenegro, North Macedonia and Estonia joining the pass system for the first time. Overnight sleeper services between major hubs have also been reintroduced, offering a sustainable alternative to short-haul flights across Europe.",
    image:
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80",
    time: "8 hrs ago",
    tag: "Europe",
  },
  {
    id: 4,
    title: "Sustainable tourism initiatives gain momentum across Eurasia",
    description:
      "Governments and organizations push for eco-friendly travel practices throughout the region. A new coalition of 18 countries has pledged to reduce tourism-related carbon emissions by 30% before 2030. Key measures include limiting visitor numbers at fragile natural sites, investing in electric transport for tourist areas, and introducing green certification standards for hotels and tour operators across Central and Southeast Asia.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80",
    time: "12 hrs ago",
    tag: "Sustainability",
  },
  {
    id: 5,
    title: "Hidden gems: 10 underrated destinations in Eastern Europe",
    description:
      "From mountain villages to coastal towns, these spots offer authentic experiences away from crowds. The list highlights places like Plovdiv in Bulgaria, the Tatra Mountains on the Polish-Slovak border, and the Dalmatian hinterland in Croatia. Travel experts say these destinations provide the charm and culture of Western Europe's most popular cities at a fraction of the cost, with local communities actively welcoming responsible visitors.",
    image:
      "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400&q=80",
    time: "1 day ago",
    tag: "Guides",
  },
  {
    id: 6,
    title: "Digital nomad visas expand across Southeast Asia",
    description:
      "More countries introduce long-stay visa options for remote workers seeking tropical destinations. Thailand, Indonesia and Malaysia have all updated their programmes with lower income thresholds and streamlined applications. Co-working spaces in cities like Chiang Mai, Bali and Kuala Lumpur report occupancy rates above 90%, as the region cements its reputation as a global hub for location-independent professionals.",
    image:
      "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=400&q=80",
    time: "1 day ago",
    tag: "Asia",
  },
  {
    id: 7,
    title: "UNESCO adds 12 new World Heritage Sites in Eurasia",
    description:
      "The latest additions include ancient ruins, natural wonders, and cultural landscapes across the continent. Notable entries are the Silk Road caravanserais of Uzbekistan, the volcanic plateau of Eastern Turkey, and the old-growth forests of the Russian Far East. Experts say the new designations will boost conservation efforts and draw international attention to regions that have long been overlooked by mainstream tourism.",
    image:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80",
    time: "2 days ago",
    tag: "Culture",
  },
];

const LatestNews = () => {
  const featured = newsData[0];
  const sideNews = newsData.slice(1, 4);
  const bottomNews = newsData.slice(4, 7);

  return (
    <section className="latest-news">
      <div className="latest-news__container">
        <h2 className="latest-news__title">Latest News</h2>

        <div className="latest-news__grid">
          {/* Featured large card - left */}
          <div className="latest-news__featured">
            <a href="#" className="latest-news__featured-link">
              <div className="latest-news__featured-image">
                <img src={featured.image} alt={featured.title} />
              </div>
              <div className="latest-news__featured-content">
                <span className="latest-news__tag">{featured.tag}</span>
                <h3 className="latest-news__featured-headline">
                  {featured.title}
                </h3>
                <p className="latest-news__featured-desc">
                  {featured.description}
                </p>
                <span className="latest-news__time">{featured.time}</span>
              </div>
            </a>
          </div>

          {/* Side column - 3 news stacked */}
          <div className="latest-news__side">
            {sideNews.map((item) => (
              <a href="#" className="latest-news__side-card" key={item.id}>
                <div className="latest-news__side-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="latest-news__side-content">
                  <span className="latest-news__tag">{item.tag}</span>
                  <h3 className="latest-news__side-headline">{item.title}</h3>
                  <p className="latest-news__side-desc">{item.description}</p>
                  <span className="latest-news__time">{item.time}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row - 3 news in a row */}
        <div className="latest-news__bottom">
          {bottomNews.map((item) => (
            <a href="#" className="latest-news__bottom-card" key={item.id}>
              <div className="latest-news__bottom-image">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="latest-news__bottom-content">
                <span className="latest-news__tag">{item.tag}</span>
                <h3 className="latest-news__bottom-headline">{item.title}</h3>
                <p className="latest-news__bottom-desc">{item.description}</p>
                <span className="latest-news__time">{item.time}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
