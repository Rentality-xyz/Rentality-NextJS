import Search from "./search";

function Guest() {
  return <Search />;
}

Guest.allowAnonymousAccess = Search.allowAnonymousAccess;

export default Guest;
