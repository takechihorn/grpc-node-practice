var greets = require("../server/protos/greet_pb");
var service = require("../server/protos/greet_grpc_pb");

var calc = require("../server/protos/calculator_pb");
var calcService = require("../server/protos/calculator_grpc_pb");

var grpc = require("grpc");

/*
  Implements the greet RPC method.
*/
// Server側で計算をする
function sum(call, callback) {
  var sumResponse = new calc.SumResponse();
  sumResponse.setSumResult(
    call.request.getFirstNumber() + call.request.getSecondNumber()
  );
  // 返す処理callbackにやらせる
  callback(null, sumResponse);
}

function greetManyTimes(call, callback) {
  var firstName = call.request.getGreeting().getFirstName();

  let count = 0,
    intervalID = setInterval(function () {
      var greetManyTimesResponse = new greets.GreetManyTimesResponse();
      greetManyTimesResponse.setResult(firstName);

      // setup streaming
      call.write(greetManyTimesResponse);

      if (++count > 9) {
        clearInterval(intervalID);
        call.end(); // we have sent all messages!
      }
    }, 1000);
}

// primeFactor -
function primeNumberDecomposition(call, callback) {
  var number = call.request.getNumber();
  var divisor = 2;

  console.log("Received number: ", number);
  while (number > 1) {
    if (number % divisor === 0) {
      var primeNumberDecompositionResponse =
        new calc.PrimeNumberDecompositionResponse();
      primeNumberDecompositionResponse.setPrimeFactor(divisor);

      number = number / divisor;
      //write the message using call.write()

      call.write(primeNumberDecompositionResponse);
    } else {
      divisor++;
      console.log("Divisor has increased to ", divisor);
    }
  }
  call.end(); // all messages sent! we are done
}

//
function longGreet(call, callback) {
  call.on("data", (request) => {
    var fullName =
      request.getGreet().getFirstName() +
      " " +
      request.getGreet().getLastName();
    console.log("Hello " + fullName);
  });

  call.on("error", (error) => {
    console.error(error);
  });

  call.on("end", () => {
    var response = new greets.LongGreetResponse();
    response.setResult("Long Greet Client Streaming....");

    callback(null, response);
  });
}

function greet(call, callback) {
  var greeting = new greets.GreetResponse();

  greeting.setResult(
    "Hello " +
      call.request.getGreeting().getFirstName() +
      " " +
      call.request.getGreeting().getLastName()
  );
  callback(null, greeting);
}

function main() {
  var server = new grpc.Server();
  server.addService(calcService.CalculatorServiceService, {
    sum: sum,
    primeNumberDecomposition: primeNumberDecomposition,
    longGreet: longGreet,
  });
  // server.addService(service.GreetServiceService, {
  //   greet: greet,
  //   greetManyTimes: greetManyTimes,
  // });
  server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
  server.start();
  console.log("Server running on port 127.0.0.1:50051");
}

main();
