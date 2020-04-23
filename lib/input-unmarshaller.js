const { Transform } = require("stream");
const RiffError = require("./riff-error");
const { types: errorTypes } = require("./errors");
const {
    canUnmarshall,
    determineContentTypes,
    unmarshaller,
} = require("./content-negotiation");

module.exports = class InputUnmarshaller extends Transform {
    constructor(argumentTransformer) {
        super({ objectMode: true });
    }

    _transform(inputSignal, _, callback) {
        const dataSignal = inputSignal.data;
        const inputIndex = dataSignal.argIndex || 0;
        const rawPayload = dataSignal.payload;
        const contentType = dataSignal.contentType;
        const acceptedContentType = determineContentTypes(contentType).accept;
        if (!canUnmarshall(acceptedContentType)) {
            callback(
                new RiffError(
                    errorTypes.UNSUPPORTED_INPUT_CONTENT_TYPE,
                    `Unsupported content-type '${contentType}' for input #${inputIndex}`
                )
            );
            return;
        }

        let unmarshalledPayload;
        try {
            unmarshalledPayload = unmarshaller(acceptedContentType)(rawPayload);
            console.debug(`Forwarding data for input #${inputIndex}`);
        } catch (err) {
            callback(new RiffError(errorTypes.INVALID_INPUT, err));
            return;
        }

        try {
            callback(null, unmarshalledPayload);
        } catch (err) {
            // propagate downstream error
            this.emit("error", err);
        }
    }
};
