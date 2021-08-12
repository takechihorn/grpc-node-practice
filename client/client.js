var greets = require("../server/protos/greet_pb");
var service = require("../server/protos/greet_grpc_pb");

var calc = require("../server/protos/calculator_pb");
var calcService = require("../server/protos/calculator_grpc_pb");
var grpc = require("grpc");

function callGreetings() {
  console.log("Hello From Client");

  // Created our server client
  var client = new service.GreetServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  //  create our server request
  var request = new greets.GreetRequest();

  // created a protocol buffer greeting message
  var greeting = new greets.Greeting();
  greeting.setFirstName("Takeru");
  greeting.setLastName("Kondoooooooooooooo");

  // set the Greeting
  request.setGreeting(greeting);
  client.greet(request, (error, response) => {
    if (!error) {
      console.log("Greeting Response: ", response.getResult());
    } else {
      console.error(error);
    }
  });

  console.log("client", client);
}

// ターミナルに表示させる処理
function callSum() {
  // Created our server client
  var client = new calcService.CalculatorServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  // リクエストを作る
  var sumRequest = new calc.SumRequest();
  sumRequest.setFirstNumber(10);
  sumRequest.setSecondNumber(15);

  client.sum(sumRequest, (error, response) => {
    if (!error) {
      console.log(
        sumRequest.getFirstNumber() +
          " + " +
          sumRequest.getSecondNumber() +
          " = " +
          response.getSumResult()
      );
    } else {
      console.error(error);
    }
  });

  console.log("client", client);
}

function callGreetManyTimes() {
  var client = new service.GreetServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  // create request
  var request = new greets.GreetManyTimesRequest();

  var greeting = new greets.Greeting();
  greeting.setFirstName("Takeru");
  greeting.setLastName("Kondoooooooooooooo");
  request.setGreeting(greeting);

  var call = client.greetManyTimes(request, () => {});

  call.on("data", (response) => {
    console.log("Client Streaming Response: ", response.getResult());
  });
  call.on("status", (status) => {
    console.log(status.details);
  });

  call.on("error", (error) => {
    console.error(error.details);
  });

  call.on("end", () => {
    console.log("Streaming Ended!");
  });
}

function callPrimeNumberDecomposition() {
  var client = new calcService.CalculatorServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  var request = new calc.PrimeNumberDecompositionRequest();

  var number = 7897896;
  request.setNumber(number);

  var call = client.primeNumberDecomposition(request, () => {});

  call.on("data", (response) => {
    console.log("Prime Factors Found: ", response.getPrimeFactor());
  });
  call.on("error", (error) => {
    console.error(error);
  });
  call.on("status", (status) => {
    console.log(status);
  });

  call.on("end", () => {
    console.log("Streaming Ended!");
  });
}

function callLongGreeting() {
  // Created our server client
  var client = new service.GreetServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  var request = new greets.LongGreetRequest();

  var call = client.longGreet(request, (error, response) => {
    if (!error) {
      console.log("Server Response: ", response.getResult());
    } else {
      console.error(error);
    }
  });

  let count = 0,
    intervalID = setInterval(function () {
      console.log("Sending message " + count);
      var request = new greets.LongGreetRequest();
      var greeting = new greets.Greeting();
      greeting.setFirstName("Takeru");
      greeting.setLastName("Kondo");

      request.setGreet(greeting);

      call.write(request);

      if (++count > 3) {
        clearInterval(intervalID);
        call.end(); // we have sent all the messages
      }
    }, 1000);
}

function main() {
  callLongGreeting();
  // callPrimeNumberDecomposition();
  // callGreetManyTimes();
  //callGreetings();
  // callSum();
}
main();
