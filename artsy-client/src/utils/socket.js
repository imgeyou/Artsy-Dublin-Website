
//import { io } from "socket.io-client";

//const socket = io("http://localhost:3005", {
  //withCredentials: true,
  //autoConnect: false,
//});

//export default socket;


//change to this to match backend:
//import { io } from "socket.io-client";

//const socket = io("http://localhost:3000", {  // was 3005, backend runs on 3000
  //withCredentials: true,
  // removed autoConnect: false -let it connect automatically
//});

//export default socket;


import { io } from "socket.io-client";

const socket = io("/", {
  withCredentials: true,
  autoConnect: false,
  transports: ["polling"],
});

export default socket;


