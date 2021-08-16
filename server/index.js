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

function computeAverage(call, callback) {
  // running sum and count
  var sum = 0;
  var count = 0;

  call.on("data", (request) => {
    // increment sum
    sum += request.getNumber();

    console.log("Got number: " + request.getNumber());
    // increment count
    count += 1;
  });

  call.on("error", (error) => {
    console.error(error);
  });

  call.on("end", () => {
    // compute the actual average
    var average = sum / count;

    var response = new calc.ComputeAverageResponse();

    response.setAverage(average);

    callback(null, response);
  });
}

async function sleep(interval) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), interval);
  });
}

// FindMaximum - Solution
async function findMaximum(call, callback) {
  var currentMaximum = 0;
  var currentNumber = 0;

  call.on("data", (request) => {
    currentNumber = request.getNumber();
    if (currentNumber > currentMaximum) {
      currentMaximum = currentNumber;

      var response = new calc.FindMaximumResponse();
      response.setMaximum(currentMaximum);

      call.write(response);
    } else {
      // do nothing
    }
    console.log("Streamed number:", request.getNumber());
  });

  call.on("error", (error) => {
    console.error(error);
  });
  call.on("end", () => {
    var response = new calc.FindMaximumResponse();
    response.setMaximum(currentMaximum);

    call.write(response);
    call.end();
    console.log("The end !");
  });
}

async function greetEveryone(call, callback) {
  call.on("data", (response) => {
    var fullName =
      response.getGreet().getFirstName() +
      " " +
      response.getGreet().getLastName();

    console.log("Hello Server" + fullName);
  });
  call.on("error", (error) => {
    console.error(error);
  });
  call.on("end", () => {
    console.log("The End...");
  });
  for (var i = 0; i < 10; i++) {
    // var greeting = new greets.Greeting();
    // greeting.setFirstName("Takeru");
    // greeting.setLastName("Kondo");

    var request = new greets.GreetEveryoneResponse();
    request.setResult("Hikaru Pi-chan");

    call.write(request);
    await sleep(1000);
  }

  call.end();
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
function squareRoot(call, callback) {
  var number = call.request.getNumber();
  if (number >= 0) {
    var numberRoot = Math.sqrt(number);
    var response = new calc.SquareRootResponse();
    response.setNumberRoot(numberRoot);

    callback(null, response);
  } else {
    // Error handleBidiStreaming
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message:
        "The number being sent is not positive " + "Number sent: " + number,
    });
  }
}

function main() {
  var server = new grpc.Server();
  server.addService(calcService.CalculatorServiceService, {
    sum: sum,
    primeNumberDecomposition: primeNumberDecomposition,
    computeAverage: computeAverage,
    findMaximum: findMaximum,
    squareRoot: squareRoot,
  });
  // server.addService(service.GreetServiceService, {
  //   greet: greet,
  //   greetManyTimes: greetManyTimes,
  //   longGreet: longGreet,
  //   greetEveryone: greetEveryone,
  // });
  server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
  server.start();
  console.log("Server running on port 127.0.0.1:50051");
}

main();
