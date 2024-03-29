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

function callComputeAverage() {
  var client = new calcService.CalculatorServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var request = new calc.ComputeAverageRequest();

  var call = client.computeAverage(request, (error, response) => {
    if (!error) {
      console.log(
        "Received a response from the server - Average: " +
          response.getAverage()
      );
    } else {
      console.error(error);
    }
  });
  var request = new calc.ComputeAverageRequest();
  // request.setNumber(1);

  for (var i = 0; i < 1000000; i++) {
    var request = new calc.ComputeAverageRequest();
    request.setNumber(i);
    call.write(request);
  }

  call.end();
  // var requestTwo = new calc.ComputeAverageRequest();
  // requestTwo.setNumber(2);
  // var requestThree = new calc.ComputeAverageRequest();
  // requestThree.setNumber(3);
  // var requestFour = new calc.ComputeAverageRequest();
  // requestFour.setNumber(4);

  // average should be 2.5

  // call.write(request);
  // call.write(requestTwo);
  // call.write(requestThree);
  // call.write(requestFour);

  // call.end(); // we are done sending messages
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

      var requestTwo = new greets.LongGreetRequest();
      var greetingTwo = new greets.Greeting();
      greetingTwo.setFirstName("Eiichi");
      greetingTwo.setLastName("Mika");

      requestTwo.setGreet(greetingTwo);

      call.write(request);
      call.write(requestTwo);

      if (++count > 3) {
        clearInterval(intervalID);
        call.end(); // we have sent all the messages
      }
    }, 1000);
}

async function sleep(interval) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), interval);
  });
}

async function callBiDiFindMaximum() {
  // Created our server client
  console.log("hello I'm a gRPC Client");

  var client = new calcService.CalculatorServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var call = client.findMaximum(request, (error, response) => {});
  call.on("data", (response) => {
    console.log("Got new Max from Server => " + response.getMaximum());
  });
  call.on("error", (error) => {
    console.error(error);
  });
  call.on("end", () => {
    console.log("Server is completed sending messages");
  });

  // data
  let data = [3, 5, 17, 9, 8, 30, 12, 46467, 8767, 9999999];
  for (var i = 0; i < data.length; i++) {
    var request = new calc.FindMaximumRequest();
    console.log("Sending number:" + data[i]);

    request.setNumber(data[i]);
    call.write(request);
    await sleep(1000);
  }
  call.end(); //we are done sending messages
  await sleep(1000);
}

async function callBiDirect() {
  // Created our server client
  console.log("hello I'm a gRPC Client");

  var client = new service.GreetServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var call = client.greetEveryone(request, (error, response) => {
    console.log("Server Response: " + response);
  });

  call.on("data", (response) => {
    console.log("Hello Client! " + response.getResult());
  });

  call.on("error", (error) => {
    console.error(error);
  });

  call.on("end", () => {
    console.log("Client The End");
  });

  for (var i = 0; i < 10; i++) {
    var greeting = new greets.Greeting();
    greeting.setFirstName("Eiichi");
    greeting.setLastName("Mika");

    var request = new greets.GreetEveryoneRequest();
    request.setGreet(greeting);

    call.write(request);

    await sleep(1500);
  }

  call.end();
}

function doErrorCall() {
  // Created our server client
  console.log("hello I'm a gRPC Client'");
  var client = new calcService.CalculatorServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var number = -1;
  var squareRootRequest = new calc.SquareRootRequest();
  squareRootRequest.setNumber(number);

  client.squareRoot(squareRootRequest, (error, response) => {
    if (!error) {
      console.log("Square root is ", response.getNumberRoot());
    } else {
      console.log(error.message);
    }
  });
}

function main() {
  doErrorCall();
  // callBiDiFindMaximum();
  // callBiDirect();
  // callComputeAverage();
  // callLongGreeting();
  // callPrimeNumberDecomposition();
  // callGreetManyTimes();
  //callGreetings();
  // callSum();
}
main();
