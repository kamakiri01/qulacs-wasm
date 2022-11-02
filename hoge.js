
var m = require("./lib/main/index");

m.initQulacsModule({useWorker: false})
    .then((client => {
        console.log("client", !!client);
        const size = 3;
        var result = client.getStateVectorWithExpectationValue({
            circuitInfo: {
                circuit: [[
                    {type: "x"},
                    {type: "x"}
                ]],
                size: size
            },
            observableInfo: {
                observable: [{
                    coefficient: 1,
                    operators: ["z", "z"]
                },
                {
                    coefficient: 1,
                    operators: ["z"]
                }]
            }
        });
        console.log("result" , result);
    }))

