import Search from "./guest/search";

function Home() {
  return <Search />;
}

Home.allowAnonymousAccess = Search.allowAnonymousAccess;

export default Home;
