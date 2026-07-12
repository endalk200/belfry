/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $Array = $util.global.Array, $TypeError = $util.global.TypeError, $Number = $util.global.Number, $parseInt = $util.global.parseInt, $String = $util.global.String, $BigInt = $util.global.BigInt, $Boolean = $util.global.Boolean, $isFinite = $util.global.isFinite;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const opentelemetry = $root.opentelemetry = (() => {

    /**
     * Namespace opentelemetry.
     * @exports opentelemetry
     * @namespace
     */
    const opentelemetry = {};

    opentelemetry.proto = (function() {

        /**
         * Namespace proto.
         * @memberof opentelemetry
         * @namespace
         */
        const proto = {};

        proto.collector = (function() {

            /**
             * Namespace collector.
             * @memberof opentelemetry.proto
             * @namespace
             */
            const collector = {};

            collector.trace = (function() {

                /**
                 * Namespace trace.
                 * @memberof opentelemetry.proto.collector
                 * @namespace
                 */
                const trace = {};

                trace.v1 = (function() {

                    /**
                     * Namespace v1.
                     * @memberof opentelemetry.proto.collector.trace
                     * @namespace
                     */
                    const v1 = {};

                    v1.TraceService = (function() {

                        /**
                         * Constructs a new TraceService service.
                         * @memberof opentelemetry.proto.collector.trace.v1
                         * @classdesc Represents a TraceService
                         * @extends $protobuf.rpc.Service
                         * @constructor
                         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
                         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
                         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
                         */
                        const TraceService = function(rpcImpl, requestDelimited, responseDelimited) {
                            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
                        };

                        $Object.defineProperty(TraceService.prototype = $Object.create($protobuf.rpc.Service.prototype), "constructor", { value: TraceService, writable: true, enumerable: false, configurable: true });

                        /**
                         * Creates new TraceService service using the specified rpc implementation.
                         * @function create
                         * @memberof opentelemetry.proto.collector.trace.v1.TraceService
                         * @static
                         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
                         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
                         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
                         * @returns {TraceService} RPC service. Useful where requests and/or responses are streamed.
                         */
                        TraceService.create = function(rpcImpl, requestDelimited, responseDelimited) {
                            return new this(rpcImpl, requestDelimited, responseDelimited);
                        };

                        /**
                         * Callback as used by {@link opentelemetry.proto.collector.trace.v1.TraceService#export_}.
                         * @memberof opentelemetry.proto.collector.trace.v1.TraceService
                         * @typedef ExportCallback
                         * @type {function}
                         * @param {Error|null} error Error, if any
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse} [response] ExportTraceServiceResponse
                         */

                        /**
                         * Calls Export.
                         * @memberof opentelemetry.proto.collector.trace.v1.TraceService
                         * @typedef Export
                         * @type {{
                         *   (request: opentelemetry.proto.collector.trace.v1.IExportTraceServiceRequest, callback: opentelemetry.proto.collector.trace.v1.TraceService.ExportCallback): void;
                         *   (request: opentelemetry.proto.collector.trace.v1.IExportTraceServiceRequest): Promise<opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse>;
                         *   readonly name: "Export";
                         *   readonly path: "/opentelemetry.proto.collector.trace.v1.TraceService/Export";
                         *   readonly requestType: "ExportTraceServiceRequest";
                         *   readonly responseType: "ExportTraceServiceResponse";
                         *   readonly requestStream: undefined;
                         *   readonly responseStream: undefined;
                         * }}
                         */

                        /**
                         * Calls Export.
                         * @name opentelemetry.proto.collector.trace.v1.TraceService#export
                         * @type {opentelemetry.proto.collector.trace.v1.TraceService.Export}
                         */
                        $Object.defineProperties(TraceService.prototype["export"] = function(request, callback) {
                            return $protobuf.rpc.Service.prototype.rpcCall.call(this, TraceService.prototype["export"], $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest, $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse, request, callback);
                        }, {
                            name: { value: "Export" },
                            path: { value: "/opentelemetry.proto.collector.trace.v1.TraceService/Export" },
                            requestType: { value: "ExportTraceServiceRequest" },
                            responseType: { value: "ExportTraceServiceResponse" },
                            requestStream: { value: $undefined },
                            responseStream: { value: $undefined }
                        });

                        return TraceService;
                    })();

                    v1.ExportTraceServiceRequest = (function() {

                        /**
                         * Properties of an ExportTraceServiceRequest.
                         * @typedef {Object} opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties
                         * @property {Array.<opentelemetry.proto.trace.v1.ResourceSpans.$Properties>|null} [resourceSpans] ExportTraceServiceRequest resourceSpans
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of an ExportTraceServiceRequest.
                         * @memberof opentelemetry.proto.collector.trace.v1
                         * @interface IExportTraceServiceRequest
                         * @augments opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties
                         * @deprecated Use opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties instead.
                         */

                        /**
                         * Shape of an ExportTraceServiceRequest.
                         * @typedef {{
                         *   resourceSpans?: Array.<opentelemetry.proto.trace.v1.ResourceSpans.$Shape>|null;
                         *   $unknowns?: Array.<Uint8Array>;
                         * }} opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape
                         */

                        /**
                         * Constructs a new ExportTraceServiceRequest.
                         * @memberof opentelemetry.proto.collector.trace.v1
                         * @classdesc Represents an ExportTraceServiceRequest.
                         * @constructor
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const ExportTraceServiceRequest = function (properties) {
                            this.resourceSpans = [];
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * ExportTraceServiceRequest resourceSpans.
                         * @member {Array.<opentelemetry.proto.trace.v1.ResourceSpans.$Properties>} resourceSpans
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @instance
                         */
                        ExportTraceServiceRequest.prototype.resourceSpans = $util.emptyArray;

                        /**
                         * Creates a new ExportTraceServiceRequest instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest} ExportTraceServiceRequest instance
                         * @type {{
                         *   (properties: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape;
                         *   (properties?: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest;
                         * }}
                         */
                        ExportTraceServiceRequest.create = function(properties) {
                            return new ExportTraceServiceRequest(properties);
                        };

                        /**
                         * Encodes the specified ExportTraceServiceRequest message. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties} message ExportTraceServiceRequest message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportTraceServiceRequest.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.resourceSpans != null && message.resourceSpans.length)
                                for (let i = 0; i < message.resourceSpans.length; ++i)
                                    $root.opentelemetry.proto.trace.v1.ResourceSpans.encode(message.resourceSpans[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified ExportTraceServiceRequest message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties} message ExportTraceServiceRequest message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportTraceServiceRequest.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes an ExportTraceServiceRequest message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape} ExportTraceServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportTraceServiceRequest.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest();
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 2)
                                            break;
                                        if (!(message.resourceSpans && message.resourceSpans.length))
                                            message.resourceSpans = [];
                                        message.resourceSpans.push($root.opentelemetry.proto.trace.v1.ResourceSpans.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes an ExportTraceServiceRequest message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape} ExportTraceServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportTraceServiceRequest.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an ExportTraceServiceRequest message.
                         * @function verify
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        ExportTraceServiceRequest.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.resourceSpans != null && $Object.hasOwnProperty.call(message, "resourceSpans")) {
                                if (!$Array.isArray(message.resourceSpans))
                                    return "resourceSpans: array expected";
                                for (let i = 0; i < message.resourceSpans.length; ++i) {
                                    let error = $root.opentelemetry.proto.trace.v1.ResourceSpans.verify(message.resourceSpans[i], _depth + 1);
                                    if (error)
                                        return "resourceSpans." + error;
                                }
                            }
                            return null;
                        };

                        /**
                         * Creates an ExportTraceServiceRequest message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest} ExportTraceServiceRequest
                         */
                        ExportTraceServiceRequest.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest();
                            if (object.resourceSpans) {
                                if (!$Array.isArray(object.resourceSpans))
                                    throw $TypeError(".opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.resourceSpans: array expected");
                                message.resourceSpans = $Array(object.resourceSpans.length);
                                for (let i = 0; i < object.resourceSpans.length; ++i) {
                                    if (!$util.isObject(object.resourceSpans[i]))
                                        throw $TypeError(".opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.resourceSpans: object expected");
                                    message.resourceSpans[i] = $root.opentelemetry.proto.trace.v1.ResourceSpans.fromObject(object.resourceSpans[i], _depth + 1);
                                }
                            }
                            return message;
                        };

                        /**
                         * Creates a plain object from an ExportTraceServiceRequest message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest} message ExportTraceServiceRequest
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        ExportTraceServiceRequest.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.arrays || options.defaults)
                                object.resourceSpans = [];
                            if (message.resourceSpans && message.resourceSpans.length) {
                                object.resourceSpans = $Array(message.resourceSpans.length);
                                for (let j = 0; j < message.resourceSpans.length; ++j)
                                    object.resourceSpans[j] = $root.opentelemetry.proto.trace.v1.ResourceSpans.toObject(message.resourceSpans[j], options, _depth + 1);
                            }
                            return object;
                        };

                        /**
                         * Converts this ExportTraceServiceRequest to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        ExportTraceServiceRequest.prototype.toJSON = function() {
                            return ExportTraceServiceRequest.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for ExportTraceServiceRequest
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        ExportTraceServiceRequest.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest";
                        };

                        return ExportTraceServiceRequest;
                    })();

                    v1.ExportTraceServiceResponse = (function() {

                        /**
                         * Properties of an ExportTraceServiceResponse.
                         * @typedef {Object} opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties
                         * @property {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties|null} [partialSuccess] ExportTraceServiceResponse partialSuccess
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of an ExportTraceServiceResponse.
                         * @memberof opentelemetry.proto.collector.trace.v1
                         * @interface IExportTraceServiceResponse
                         * @augments opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties
                         * @deprecated Use opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties instead.
                         */

                        /**
                         * Shape of an ExportTraceServiceResponse.
                         * @typedef {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties} opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape
                         */

                        /**
                         * Constructs a new ExportTraceServiceResponse.
                         * @memberof opentelemetry.proto.collector.trace.v1
                         * @classdesc Represents an ExportTraceServiceResponse.
                         * @constructor
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const ExportTraceServiceResponse = function (properties) {
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * ExportTraceServiceResponse partialSuccess.
                         * @member {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties|null|undefined} partialSuccess
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @instance
                         */
                        ExportTraceServiceResponse.prototype.partialSuccess = null;

                        /**
                         * Creates a new ExportTraceServiceResponse instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse} ExportTraceServiceResponse instance
                         * @type {{
                         *   (properties: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape): opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape;
                         *   (properties?: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties): opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse;
                         * }}
                         */
                        ExportTraceServiceResponse.create = function(properties) {
                            return new ExportTraceServiceResponse(properties);
                        };

                        /**
                         * Encodes the specified ExportTraceServiceResponse message. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties} message ExportTraceServiceResponse message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportTraceServiceResponse.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.partialSuccess != null && $Object.hasOwnProperty.call(message, "partialSuccess"))
                                $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.encode(message.partialSuccess, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified ExportTraceServiceResponse message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties} message ExportTraceServiceResponse message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportTraceServiceResponse.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes an ExportTraceServiceResponse message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape} ExportTraceServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportTraceServiceResponse.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse(), value;
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 2)
                                            break;
                                        message.partialSuccess = $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.decode(reader, reader.uint32(), $undefined, _depth + 1, message.partialSuccess);
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes an ExportTraceServiceResponse message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape} ExportTraceServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportTraceServiceResponse.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an ExportTraceServiceResponse message.
                         * @function verify
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        ExportTraceServiceResponse.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.partialSuccess != null && $Object.hasOwnProperty.call(message, "partialSuccess")) {
                                let error = $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.verify(message.partialSuccess, _depth + 1);
                                if (error)
                                    return "partialSuccess." + error;
                            }
                            return null;
                        };

                        /**
                         * Creates an ExportTraceServiceResponse message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse} ExportTraceServiceResponse
                         */
                        ExportTraceServiceResponse.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse();
                            if (object.partialSuccess != null) {
                                if (!$util.isObject(object.partialSuccess))
                                    throw $TypeError(".opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.partialSuccess: object expected");
                                message.partialSuccess = $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.fromObject(object.partialSuccess, _depth + 1);
                            }
                            return message;
                        };

                        /**
                         * Creates a plain object from an ExportTraceServiceResponse message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse} message ExportTraceServiceResponse
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        ExportTraceServiceResponse.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.defaults)
                                object.partialSuccess = null;
                            if (message.partialSuccess != null && $Object.hasOwnProperty.call(message, "partialSuccess"))
                                object.partialSuccess = $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.toObject(message.partialSuccess, options, _depth + 1);
                            return object;
                        };

                        /**
                         * Converts this ExportTraceServiceResponse to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        ExportTraceServiceResponse.prototype.toJSON = function() {
                            return ExportTraceServiceResponse.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for ExportTraceServiceResponse
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        ExportTraceServiceResponse.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse";
                        };

                        return ExportTraceServiceResponse;
                    })();

                    v1.ExportTracePartialSuccess = (function() {

                        /**
                         * Properties of an ExportTracePartialSuccess.
                         * @typedef {Object} opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties
                         * @property {number|Long|null} [rejectedSpans] ExportTracePartialSuccess rejectedSpans
                         * @property {string|null} [errorMessage] ExportTracePartialSuccess errorMessage
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of an ExportTracePartialSuccess.
                         * @memberof opentelemetry.proto.collector.trace.v1
                         * @interface IExportTracePartialSuccess
                         * @augments opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties
                         * @deprecated Use opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties instead.
                         */

                        /**
                         * Shape of an ExportTracePartialSuccess.
                         * @typedef {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties} opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape
                         */

                        /**
                         * Constructs a new ExportTracePartialSuccess.
                         * @memberof opentelemetry.proto.collector.trace.v1
                         * @classdesc Represents an ExportTracePartialSuccess.
                         * @constructor
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const ExportTracePartialSuccess = function (properties) {
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * ExportTracePartialSuccess rejectedSpans.
                         * @member {number|Long} rejectedSpans
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @instance
                         */
                        ExportTracePartialSuccess.prototype.rejectedSpans = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                        /**
                         * ExportTracePartialSuccess errorMessage.
                         * @member {string} errorMessage
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @instance
                         */
                        ExportTracePartialSuccess.prototype.errorMessage = "";

                        /**
                         * Creates a new ExportTracePartialSuccess instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess} ExportTracePartialSuccess instance
                         * @type {{
                         *   (properties: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape): opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape;
                         *   (properties?: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties): opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess;
                         * }}
                         */
                        ExportTracePartialSuccess.create = function(properties) {
                            return new ExportTracePartialSuccess(properties);
                        };

                        /**
                         * Encodes the specified ExportTracePartialSuccess message. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties} message ExportTracePartialSuccess message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportTracePartialSuccess.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.rejectedSpans != null && $Object.hasOwnProperty.call(message, "rejectedSpans") && (typeof message.rejectedSpans === "object" ? message.rejectedSpans.low || message.rejectedSpans.high : message.rejectedSpans !== 0))
                                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.rejectedSpans);
                            if (message.errorMessage != null && $Object.hasOwnProperty.call(message, "errorMessage") && message.errorMessage !== "")
                                writer.uint32(/* id 2, wireType 2 =*/18).string(message.errorMessage);
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified ExportTracePartialSuccess message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties} message ExportTracePartialSuccess message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportTracePartialSuccess.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes an ExportTracePartialSuccess message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape} ExportTracePartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportTracePartialSuccess.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess(), value;
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 0)
                                            break;
                                        if (typeof (value = reader.int64()) === "object" ? value.low || value.high : value !== 0)
                                            message.rejectedSpans = value;
                                        else
                                            delete message.rejectedSpans;
                                        continue;
                                    }
                                case 2: {
                                        if (wireType !== 2)
                                            break;
                                        if ((value = reader.stringVerify()).length)
                                            message.errorMessage = value;
                                        else
                                            delete message.errorMessage;
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes an ExportTracePartialSuccess message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape} ExportTracePartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportTracePartialSuccess.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an ExportTracePartialSuccess message.
                         * @function verify
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        ExportTracePartialSuccess.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.rejectedSpans != null && $Object.hasOwnProperty.call(message, "rejectedSpans"))
                                if (!$util.isInteger(message.rejectedSpans) && !(message.rejectedSpans && $util.isInteger(message.rejectedSpans.low) && $util.isInteger(message.rejectedSpans.high)))
                                    return "rejectedSpans: integer|Long expected";
                            if (message.errorMessage != null && $Object.hasOwnProperty.call(message, "errorMessage"))
                                if (!$util.isString(message.errorMessage))
                                    return "errorMessage: string expected";
                            return null;
                        };

                        /**
                         * Creates an ExportTracePartialSuccess message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess} ExportTracePartialSuccess
                         */
                        ExportTracePartialSuccess.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess();
                            if (object.rejectedSpans != null)
                                if (typeof object.rejectedSpans === "object" ? object.rejectedSpans.low || object.rejectedSpans.high : $Number(object.rejectedSpans) !== 0)
                                    if ($util.Long)
                                        message.rejectedSpans = $util.Long.fromValue(object.rejectedSpans, false);
                                    else if (typeof object.rejectedSpans === "string")
                                        message.rejectedSpans = $parseInt(object.rejectedSpans, 10);
                                    else if (typeof object.rejectedSpans === "number")
                                        message.rejectedSpans = object.rejectedSpans;
                                    else if (typeof object.rejectedSpans === "object")
                                        message.rejectedSpans = new $util.LongBits(object.rejectedSpans.low >>> 0, object.rejectedSpans.high >>> 0).toNumber();
                            if (object.errorMessage != null)
                                if (typeof object.errorMessage !== "string" || object.errorMessage.length)
                                    message.errorMessage = $String(object.errorMessage);
                            return message;
                        };

                        /**
                         * Creates a plain object from an ExportTracePartialSuccess message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess} message ExportTracePartialSuccess
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        ExportTracePartialSuccess.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.defaults) {
                                if ($util.Long) {
                                    let long = new $util.Long(0, 0, false);
                                    object.rejectedSpans = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                                } else
                                    object.rejectedSpans = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                                object.errorMessage = "";
                            }
                            if (message.rejectedSpans != null && $Object.hasOwnProperty.call(message, "rejectedSpans"))
                                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                    object.rejectedSpans = typeof message.rejectedSpans === "number" ? $BigInt(message.rejectedSpans) : $util.Long.fromBits(message.rejectedSpans.low >>> 0, message.rejectedSpans.high >>> 0, false).toBigInt();
                                else if (typeof message.rejectedSpans === "number")
                                    object.rejectedSpans = options.longs === $String ? $String(message.rejectedSpans) : message.rejectedSpans;
                                else
                                    object.rejectedSpans = options.longs === $String ? $util.Long.prototype.toString.call(message.rejectedSpans) : options.longs === $Number ? new $util.LongBits(message.rejectedSpans.low >>> 0, message.rejectedSpans.high >>> 0).toNumber() : message.rejectedSpans;
                            if (message.errorMessage != null && $Object.hasOwnProperty.call(message, "errorMessage"))
                                object.errorMessage = message.errorMessage;
                            return object;
                        };

                        /**
                         * Converts this ExportTracePartialSuccess to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        ExportTracePartialSuccess.prototype.toJSON = function() {
                            return ExportTracePartialSuccess.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for ExportTracePartialSuccess
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        ExportTracePartialSuccess.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess";
                        };

                        return ExportTracePartialSuccess;
                    })();

                    return v1;
                })();

                return trace;
            })();

            collector.logs = (function() {

                /**
                 * Namespace logs.
                 * @memberof opentelemetry.proto.collector
                 * @namespace
                 */
                const logs = {};

                logs.v1 = (function() {

                    /**
                     * Namespace v1.
                     * @memberof opentelemetry.proto.collector.logs
                     * @namespace
                     */
                    const v1 = {};

                    v1.LogsService = (function() {

                        /**
                         * Constructs a new LogsService service.
                         * @memberof opentelemetry.proto.collector.logs.v1
                         * @classdesc Represents a LogsService
                         * @extends $protobuf.rpc.Service
                         * @constructor
                         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
                         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
                         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
                         */
                        const LogsService = function(rpcImpl, requestDelimited, responseDelimited) {
                            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
                        };

                        $Object.defineProperty(LogsService.prototype = $Object.create($protobuf.rpc.Service.prototype), "constructor", { value: LogsService, writable: true, enumerable: false, configurable: true });

                        /**
                         * Creates new LogsService service using the specified rpc implementation.
                         * @function create
                         * @memberof opentelemetry.proto.collector.logs.v1.LogsService
                         * @static
                         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
                         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
                         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
                         * @returns {LogsService} RPC service. Useful where requests and/or responses are streamed.
                         */
                        LogsService.create = function(rpcImpl, requestDelimited, responseDelimited) {
                            return new this(rpcImpl, requestDelimited, responseDelimited);
                        };

                        /**
                         * Callback as used by {@link opentelemetry.proto.collector.logs.v1.LogsService#export_}.
                         * @memberof opentelemetry.proto.collector.logs.v1.LogsService
                         * @typedef ExportCallback
                         * @type {function}
                         * @param {Error|null} error Error, if any
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse} [response] ExportLogsServiceResponse
                         */

                        /**
                         * Calls Export.
                         * @memberof opentelemetry.proto.collector.logs.v1.LogsService
                         * @typedef Export
                         * @type {{
                         *   (request: opentelemetry.proto.collector.logs.v1.IExportLogsServiceRequest, callback: opentelemetry.proto.collector.logs.v1.LogsService.ExportCallback): void;
                         *   (request: opentelemetry.proto.collector.logs.v1.IExportLogsServiceRequest): Promise<opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse>;
                         *   readonly name: "Export";
                         *   readonly path: "/opentelemetry.proto.collector.logs.v1.LogsService/Export";
                         *   readonly requestType: "ExportLogsServiceRequest";
                         *   readonly responseType: "ExportLogsServiceResponse";
                         *   readonly requestStream: undefined;
                         *   readonly responseStream: undefined;
                         * }}
                         */

                        /**
                         * Calls Export.
                         * @name opentelemetry.proto.collector.logs.v1.LogsService#export
                         * @type {opentelemetry.proto.collector.logs.v1.LogsService.Export}
                         */
                        $Object.defineProperties(LogsService.prototype["export"] = function(request, callback) {
                            return $protobuf.rpc.Service.prototype.rpcCall.call(this, LogsService.prototype["export"], $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest, $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse, request, callback);
                        }, {
                            name: { value: "Export" },
                            path: { value: "/opentelemetry.proto.collector.logs.v1.LogsService/Export" },
                            requestType: { value: "ExportLogsServiceRequest" },
                            responseType: { value: "ExportLogsServiceResponse" },
                            requestStream: { value: $undefined },
                            responseStream: { value: $undefined }
                        });

                        return LogsService;
                    })();

                    v1.ExportLogsServiceRequest = (function() {

                        /**
                         * Properties of an ExportLogsServiceRequest.
                         * @typedef {Object} opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties
                         * @property {Array.<opentelemetry.proto.logs.v1.ResourceLogs.$Properties>|null} [resourceLogs] ExportLogsServiceRequest resourceLogs
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of an ExportLogsServiceRequest.
                         * @memberof opentelemetry.proto.collector.logs.v1
                         * @interface IExportLogsServiceRequest
                         * @augments opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties
                         * @deprecated Use opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties instead.
                         */

                        /**
                         * Shape of an ExportLogsServiceRequest.
                         * @typedef {{
                         *   resourceLogs?: Array.<opentelemetry.proto.logs.v1.ResourceLogs.$Shape>|null;
                         *   $unknowns?: Array.<Uint8Array>;
                         * }} opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape
                         */

                        /**
                         * Constructs a new ExportLogsServiceRequest.
                         * @memberof opentelemetry.proto.collector.logs.v1
                         * @classdesc Represents an ExportLogsServiceRequest.
                         * @constructor
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const ExportLogsServiceRequest = function (properties) {
                            this.resourceLogs = [];
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * ExportLogsServiceRequest resourceLogs.
                         * @member {Array.<opentelemetry.proto.logs.v1.ResourceLogs.$Properties>} resourceLogs
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @instance
                         */
                        ExportLogsServiceRequest.prototype.resourceLogs = $util.emptyArray;

                        /**
                         * Creates a new ExportLogsServiceRequest instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest} ExportLogsServiceRequest instance
                         * @type {{
                         *   (properties: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape): opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape;
                         *   (properties?: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties): opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest;
                         * }}
                         */
                        ExportLogsServiceRequest.create = function(properties) {
                            return new ExportLogsServiceRequest(properties);
                        };

                        /**
                         * Encodes the specified ExportLogsServiceRequest message. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties} message ExportLogsServiceRequest message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportLogsServiceRequest.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.resourceLogs != null && message.resourceLogs.length)
                                for (let i = 0; i < message.resourceLogs.length; ++i)
                                    $root.opentelemetry.proto.logs.v1.ResourceLogs.encode(message.resourceLogs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified ExportLogsServiceRequest message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties} message ExportLogsServiceRequest message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportLogsServiceRequest.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes an ExportLogsServiceRequest message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape} ExportLogsServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportLogsServiceRequest.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest();
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 2)
                                            break;
                                        if (!(message.resourceLogs && message.resourceLogs.length))
                                            message.resourceLogs = [];
                                        message.resourceLogs.push($root.opentelemetry.proto.logs.v1.ResourceLogs.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes an ExportLogsServiceRequest message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape} ExportLogsServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportLogsServiceRequest.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an ExportLogsServiceRequest message.
                         * @function verify
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        ExportLogsServiceRequest.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.resourceLogs != null && $Object.hasOwnProperty.call(message, "resourceLogs")) {
                                if (!$Array.isArray(message.resourceLogs))
                                    return "resourceLogs: array expected";
                                for (let i = 0; i < message.resourceLogs.length; ++i) {
                                    let error = $root.opentelemetry.proto.logs.v1.ResourceLogs.verify(message.resourceLogs[i], _depth + 1);
                                    if (error)
                                        return "resourceLogs." + error;
                                }
                            }
                            return null;
                        };

                        /**
                         * Creates an ExportLogsServiceRequest message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest} ExportLogsServiceRequest
                         */
                        ExportLogsServiceRequest.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest();
                            if (object.resourceLogs) {
                                if (!$Array.isArray(object.resourceLogs))
                                    throw $TypeError(".opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.resourceLogs: array expected");
                                message.resourceLogs = $Array(object.resourceLogs.length);
                                for (let i = 0; i < object.resourceLogs.length; ++i) {
                                    if (!$util.isObject(object.resourceLogs[i]))
                                        throw $TypeError(".opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.resourceLogs: object expected");
                                    message.resourceLogs[i] = $root.opentelemetry.proto.logs.v1.ResourceLogs.fromObject(object.resourceLogs[i], _depth + 1);
                                }
                            }
                            return message;
                        };

                        /**
                         * Creates a plain object from an ExportLogsServiceRequest message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest} message ExportLogsServiceRequest
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        ExportLogsServiceRequest.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.arrays || options.defaults)
                                object.resourceLogs = [];
                            if (message.resourceLogs && message.resourceLogs.length) {
                                object.resourceLogs = $Array(message.resourceLogs.length);
                                for (let j = 0; j < message.resourceLogs.length; ++j)
                                    object.resourceLogs[j] = $root.opentelemetry.proto.logs.v1.ResourceLogs.toObject(message.resourceLogs[j], options, _depth + 1);
                            }
                            return object;
                        };

                        /**
                         * Converts this ExportLogsServiceRequest to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        ExportLogsServiceRequest.prototype.toJSON = function() {
                            return ExportLogsServiceRequest.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for ExportLogsServiceRequest
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        ExportLogsServiceRequest.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest";
                        };

                        return ExportLogsServiceRequest;
                    })();

                    v1.ExportLogsServiceResponse = (function() {

                        /**
                         * Properties of an ExportLogsServiceResponse.
                         * @typedef {Object} opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties
                         * @property {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties|null} [partialSuccess] ExportLogsServiceResponse partialSuccess
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of an ExportLogsServiceResponse.
                         * @memberof opentelemetry.proto.collector.logs.v1
                         * @interface IExportLogsServiceResponse
                         * @augments opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties
                         * @deprecated Use opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties instead.
                         */

                        /**
                         * Shape of an ExportLogsServiceResponse.
                         * @typedef {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties} opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape
                         */

                        /**
                         * Constructs a new ExportLogsServiceResponse.
                         * @memberof opentelemetry.proto.collector.logs.v1
                         * @classdesc Represents an ExportLogsServiceResponse.
                         * @constructor
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const ExportLogsServiceResponse = function (properties) {
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * ExportLogsServiceResponse partialSuccess.
                         * @member {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties|null|undefined} partialSuccess
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @instance
                         */
                        ExportLogsServiceResponse.prototype.partialSuccess = null;

                        /**
                         * Creates a new ExportLogsServiceResponse instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse} ExportLogsServiceResponse instance
                         * @type {{
                         *   (properties: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape): opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape;
                         *   (properties?: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties): opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse;
                         * }}
                         */
                        ExportLogsServiceResponse.create = function(properties) {
                            return new ExportLogsServiceResponse(properties);
                        };

                        /**
                         * Encodes the specified ExportLogsServiceResponse message. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties} message ExportLogsServiceResponse message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportLogsServiceResponse.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.partialSuccess != null && $Object.hasOwnProperty.call(message, "partialSuccess"))
                                $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.encode(message.partialSuccess, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified ExportLogsServiceResponse message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties} message ExportLogsServiceResponse message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportLogsServiceResponse.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes an ExportLogsServiceResponse message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape} ExportLogsServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportLogsServiceResponse.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse(), value;
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 2)
                                            break;
                                        message.partialSuccess = $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.decode(reader, reader.uint32(), $undefined, _depth + 1, message.partialSuccess);
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes an ExportLogsServiceResponse message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape} ExportLogsServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportLogsServiceResponse.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an ExportLogsServiceResponse message.
                         * @function verify
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        ExportLogsServiceResponse.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.partialSuccess != null && $Object.hasOwnProperty.call(message, "partialSuccess")) {
                                let error = $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.verify(message.partialSuccess, _depth + 1);
                                if (error)
                                    return "partialSuccess." + error;
                            }
                            return null;
                        };

                        /**
                         * Creates an ExportLogsServiceResponse message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse} ExportLogsServiceResponse
                         */
                        ExportLogsServiceResponse.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse();
                            if (object.partialSuccess != null) {
                                if (!$util.isObject(object.partialSuccess))
                                    throw $TypeError(".opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.partialSuccess: object expected");
                                message.partialSuccess = $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.fromObject(object.partialSuccess, _depth + 1);
                            }
                            return message;
                        };

                        /**
                         * Creates a plain object from an ExportLogsServiceResponse message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse} message ExportLogsServiceResponse
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        ExportLogsServiceResponse.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.defaults)
                                object.partialSuccess = null;
                            if (message.partialSuccess != null && $Object.hasOwnProperty.call(message, "partialSuccess"))
                                object.partialSuccess = $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.toObject(message.partialSuccess, options, _depth + 1);
                            return object;
                        };

                        /**
                         * Converts this ExportLogsServiceResponse to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        ExportLogsServiceResponse.prototype.toJSON = function() {
                            return ExportLogsServiceResponse.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for ExportLogsServiceResponse
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        ExportLogsServiceResponse.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse";
                        };

                        return ExportLogsServiceResponse;
                    })();

                    v1.ExportLogsPartialSuccess = (function() {

                        /**
                         * Properties of an ExportLogsPartialSuccess.
                         * @typedef {Object} opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties
                         * @property {number|Long|null} [rejectedLogRecords] ExportLogsPartialSuccess rejectedLogRecords
                         * @property {string|null} [errorMessage] ExportLogsPartialSuccess errorMessage
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of an ExportLogsPartialSuccess.
                         * @memberof opentelemetry.proto.collector.logs.v1
                         * @interface IExportLogsPartialSuccess
                         * @augments opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties
                         * @deprecated Use opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties instead.
                         */

                        /**
                         * Shape of an ExportLogsPartialSuccess.
                         * @typedef {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties} opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape
                         */

                        /**
                         * Constructs a new ExportLogsPartialSuccess.
                         * @memberof opentelemetry.proto.collector.logs.v1
                         * @classdesc Represents an ExportLogsPartialSuccess.
                         * @constructor
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const ExportLogsPartialSuccess = function (properties) {
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * ExportLogsPartialSuccess rejectedLogRecords.
                         * @member {number|Long} rejectedLogRecords
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @instance
                         */
                        ExportLogsPartialSuccess.prototype.rejectedLogRecords = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                        /**
                         * ExportLogsPartialSuccess errorMessage.
                         * @member {string} errorMessage
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @instance
                         */
                        ExportLogsPartialSuccess.prototype.errorMessage = "";

                        /**
                         * Creates a new ExportLogsPartialSuccess instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess} ExportLogsPartialSuccess instance
                         * @type {{
                         *   (properties: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape): opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape;
                         *   (properties?: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties): opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess;
                         * }}
                         */
                        ExportLogsPartialSuccess.create = function(properties) {
                            return new ExportLogsPartialSuccess(properties);
                        };

                        /**
                         * Encodes the specified ExportLogsPartialSuccess message. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties} message ExportLogsPartialSuccess message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportLogsPartialSuccess.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.rejectedLogRecords != null && $Object.hasOwnProperty.call(message, "rejectedLogRecords") && (typeof message.rejectedLogRecords === "object" ? message.rejectedLogRecords.low || message.rejectedLogRecords.high : message.rejectedLogRecords !== 0))
                                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.rejectedLogRecords);
                            if (message.errorMessage != null && $Object.hasOwnProperty.call(message, "errorMessage") && message.errorMessage !== "")
                                writer.uint32(/* id 2, wireType 2 =*/18).string(message.errorMessage);
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified ExportLogsPartialSuccess message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties} message ExportLogsPartialSuccess message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        ExportLogsPartialSuccess.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes an ExportLogsPartialSuccess message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape} ExportLogsPartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportLogsPartialSuccess.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess(), value;
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 0)
                                            break;
                                        if (typeof (value = reader.int64()) === "object" ? value.low || value.high : value !== 0)
                                            message.rejectedLogRecords = value;
                                        else
                                            delete message.rejectedLogRecords;
                                        continue;
                                    }
                                case 2: {
                                        if (wireType !== 2)
                                            break;
                                        if ((value = reader.stringVerify()).length)
                                            message.errorMessage = value;
                                        else
                                            delete message.errorMessage;
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes an ExportLogsPartialSuccess message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape} ExportLogsPartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        ExportLogsPartialSuccess.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an ExportLogsPartialSuccess message.
                         * @function verify
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        ExportLogsPartialSuccess.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.rejectedLogRecords != null && $Object.hasOwnProperty.call(message, "rejectedLogRecords"))
                                if (!$util.isInteger(message.rejectedLogRecords) && !(message.rejectedLogRecords && $util.isInteger(message.rejectedLogRecords.low) && $util.isInteger(message.rejectedLogRecords.high)))
                                    return "rejectedLogRecords: integer|Long expected";
                            if (message.errorMessage != null && $Object.hasOwnProperty.call(message, "errorMessage"))
                                if (!$util.isString(message.errorMessage))
                                    return "errorMessage: string expected";
                            return null;
                        };

                        /**
                         * Creates an ExportLogsPartialSuccess message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess} ExportLogsPartialSuccess
                         */
                        ExportLogsPartialSuccess.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess();
                            if (object.rejectedLogRecords != null)
                                if (typeof object.rejectedLogRecords === "object" ? object.rejectedLogRecords.low || object.rejectedLogRecords.high : $Number(object.rejectedLogRecords) !== 0)
                                    if ($util.Long)
                                        message.rejectedLogRecords = $util.Long.fromValue(object.rejectedLogRecords, false);
                                    else if (typeof object.rejectedLogRecords === "string")
                                        message.rejectedLogRecords = $parseInt(object.rejectedLogRecords, 10);
                                    else if (typeof object.rejectedLogRecords === "number")
                                        message.rejectedLogRecords = object.rejectedLogRecords;
                                    else if (typeof object.rejectedLogRecords === "object")
                                        message.rejectedLogRecords = new $util.LongBits(object.rejectedLogRecords.low >>> 0, object.rejectedLogRecords.high >>> 0).toNumber();
                            if (object.errorMessage != null)
                                if (typeof object.errorMessage !== "string" || object.errorMessage.length)
                                    message.errorMessage = $String(object.errorMessage);
                            return message;
                        };

                        /**
                         * Creates a plain object from an ExportLogsPartialSuccess message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess} message ExportLogsPartialSuccess
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        ExportLogsPartialSuccess.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.defaults) {
                                if ($util.Long) {
                                    let long = new $util.Long(0, 0, false);
                                    object.rejectedLogRecords = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                                } else
                                    object.rejectedLogRecords = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                                object.errorMessage = "";
                            }
                            if (message.rejectedLogRecords != null && $Object.hasOwnProperty.call(message, "rejectedLogRecords"))
                                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                    object.rejectedLogRecords = typeof message.rejectedLogRecords === "number" ? $BigInt(message.rejectedLogRecords) : $util.Long.fromBits(message.rejectedLogRecords.low >>> 0, message.rejectedLogRecords.high >>> 0, false).toBigInt();
                                else if (typeof message.rejectedLogRecords === "number")
                                    object.rejectedLogRecords = options.longs === $String ? $String(message.rejectedLogRecords) : message.rejectedLogRecords;
                                else
                                    object.rejectedLogRecords = options.longs === $String ? $util.Long.prototype.toString.call(message.rejectedLogRecords) : options.longs === $Number ? new $util.LongBits(message.rejectedLogRecords.low >>> 0, message.rejectedLogRecords.high >>> 0).toNumber() : message.rejectedLogRecords;
                            if (message.errorMessage != null && $Object.hasOwnProperty.call(message, "errorMessage"))
                                object.errorMessage = message.errorMessage;
                            return object;
                        };

                        /**
                         * Converts this ExportLogsPartialSuccess to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        ExportLogsPartialSuccess.prototype.toJSON = function() {
                            return ExportLogsPartialSuccess.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for ExportLogsPartialSuccess
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        ExportLogsPartialSuccess.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess";
                        };

                        return ExportLogsPartialSuccess;
                    })();

                    return v1;
                })();

                return logs;
            })();

            return collector;
        })();

        proto.trace = (function() {

            /**
             * Namespace trace.
             * @memberof opentelemetry.proto
             * @namespace
             */
            const trace = {};

            trace.v1 = (function() {

                /**
                 * Namespace v1.
                 * @memberof opentelemetry.proto.trace
                 * @namespace
                 */
                const v1 = {};

                v1.TracesData = (function() {

                    /**
                     * Properties of a TracesData.
                     * @typedef {Object} opentelemetry.proto.trace.v1.TracesData.$Properties
                     * @property {Array.<opentelemetry.proto.trace.v1.ResourceSpans.$Properties>|null} [resourceSpans] TracesData resourceSpans
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a TracesData.
                     * @memberof opentelemetry.proto.trace.v1
                     * @interface ITracesData
                     * @augments opentelemetry.proto.trace.v1.TracesData.$Properties
                     * @deprecated Use opentelemetry.proto.trace.v1.TracesData.$Properties instead.
                     */

                    /**
                     * Shape of a TracesData.
                     * @typedef {{
                     *   resourceSpans?: Array.<opentelemetry.proto.trace.v1.ResourceSpans.$Shape>|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.trace.v1.TracesData.$Shape
                     */

                    /**
                     * Constructs a new TracesData.
                     * @memberof opentelemetry.proto.trace.v1
                     * @classdesc Represents a TracesData.
                     * @constructor
                     * @param {opentelemetry.proto.trace.v1.TracesData.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const TracesData = function (properties) {
                        this.resourceSpans = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * TracesData resourceSpans.
                     * @member {Array.<opentelemetry.proto.trace.v1.ResourceSpans.$Properties>} resourceSpans
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @instance
                     */
                    TracesData.prototype.resourceSpans = $util.emptyArray;

                    /**
                     * Creates a new TracesData instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {opentelemetry.proto.trace.v1.TracesData.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.trace.v1.TracesData} TracesData instance
                     * @type {{
                     *   (properties: opentelemetry.proto.trace.v1.TracesData.$Shape): opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape;
                     *   (properties?: opentelemetry.proto.trace.v1.TracesData.$Properties): opentelemetry.proto.trace.v1.TracesData;
                     * }}
                     */
                    TracesData.create = function(properties) {
                        return new TracesData(properties);
                    };

                    /**
                     * Encodes the specified TracesData message. Does not implicitly {@link opentelemetry.proto.trace.v1.TracesData.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {opentelemetry.proto.trace.v1.TracesData.$Properties} message TracesData message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    TracesData.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.resourceSpans != null && message.resourceSpans.length)
                            for (let i = 0; i < message.resourceSpans.length; ++i)
                                $root.opentelemetry.proto.trace.v1.ResourceSpans.encode(message.resourceSpans[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified TracesData message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.TracesData.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {opentelemetry.proto.trace.v1.TracesData.$Properties} message TracesData message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    TracesData.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a TracesData message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape} TracesData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    TracesData.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.trace.v1.TracesData();
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.resourceSpans && message.resourceSpans.length))
                                        message.resourceSpans = [];
                                    message.resourceSpans.push($root.opentelemetry.proto.trace.v1.ResourceSpans.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a TracesData message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape} TracesData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    TracesData.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a TracesData message.
                     * @function verify
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    TracesData.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.resourceSpans != null && $Object.hasOwnProperty.call(message, "resourceSpans")) {
                            if (!$Array.isArray(message.resourceSpans))
                                return "resourceSpans: array expected";
                            for (let i = 0; i < message.resourceSpans.length; ++i) {
                                let error = $root.opentelemetry.proto.trace.v1.ResourceSpans.verify(message.resourceSpans[i], _depth + 1);
                                if (error)
                                    return "resourceSpans." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a TracesData message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.trace.v1.TracesData} TracesData
                     */
                    TracesData.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.trace.v1.TracesData)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.trace.v1.TracesData: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.trace.v1.TracesData();
                        if (object.resourceSpans) {
                            if (!$Array.isArray(object.resourceSpans))
                                throw $TypeError(".opentelemetry.proto.trace.v1.TracesData.resourceSpans: array expected");
                            message.resourceSpans = $Array(object.resourceSpans.length);
                            for (let i = 0; i < object.resourceSpans.length; ++i) {
                                if (!$util.isObject(object.resourceSpans[i]))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.TracesData.resourceSpans: object expected");
                                message.resourceSpans[i] = $root.opentelemetry.proto.trace.v1.ResourceSpans.fromObject(object.resourceSpans[i], _depth + 1);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a TracesData message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {opentelemetry.proto.trace.v1.TracesData} message TracesData
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    TracesData.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.resourceSpans = [];
                        if (message.resourceSpans && message.resourceSpans.length) {
                            object.resourceSpans = $Array(message.resourceSpans.length);
                            for (let j = 0; j < message.resourceSpans.length; ++j)
                                object.resourceSpans[j] = $root.opentelemetry.proto.trace.v1.ResourceSpans.toObject(message.resourceSpans[j], options, _depth + 1);
                        }
                        return object;
                    };

                    /**
                     * Converts this TracesData to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    TracesData.prototype.toJSON = function() {
                        return TracesData.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for TracesData
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.trace.v1.TracesData
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    TracesData.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.trace.v1.TracesData";
                    };

                    return TracesData;
                })();

                v1.ResourceSpans = (function() {

                    /**
                     * Properties of a ResourceSpans.
                     * @typedef {Object} opentelemetry.proto.trace.v1.ResourceSpans.$Properties
                     * @property {opentelemetry.proto.resource.v1.Resource.$Properties|null} [resource] ResourceSpans resource
                     * @property {Array.<opentelemetry.proto.trace.v1.ScopeSpans.$Properties>|null} [scopeSpans] ResourceSpans scopeSpans
                     * @property {string|null} [schemaUrl] ResourceSpans schemaUrl
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a ResourceSpans.
                     * @memberof opentelemetry.proto.trace.v1
                     * @interface IResourceSpans
                     * @augments opentelemetry.proto.trace.v1.ResourceSpans.$Properties
                     * @deprecated Use opentelemetry.proto.trace.v1.ResourceSpans.$Properties instead.
                     */

                    /**
                     * Shape of a ResourceSpans.
                     * @typedef {{
                     *   resource?: opentelemetry.proto.resource.v1.Resource.$Shape|null;
                     *   scopeSpans?: Array.<opentelemetry.proto.trace.v1.ScopeSpans.$Shape>|null;
                     *   schemaUrl?: string|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.trace.v1.ResourceSpans.$Shape
                     */

                    /**
                     * Constructs a new ResourceSpans.
                     * @memberof opentelemetry.proto.trace.v1
                     * @classdesc Represents a ResourceSpans.
                     * @constructor
                     * @param {opentelemetry.proto.trace.v1.ResourceSpans.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const ResourceSpans = function (properties) {
                        this.scopeSpans = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * ResourceSpans resource.
                     * @member {opentelemetry.proto.resource.v1.Resource.$Properties|null|undefined} resource
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @instance
                     */
                    ResourceSpans.prototype.resource = null;

                    /**
                     * ResourceSpans scopeSpans.
                     * @member {Array.<opentelemetry.proto.trace.v1.ScopeSpans.$Properties>} scopeSpans
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @instance
                     */
                    ResourceSpans.prototype.scopeSpans = $util.emptyArray;

                    /**
                     * ResourceSpans schemaUrl.
                     * @member {string} schemaUrl
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @instance
                     */
                    ResourceSpans.prototype.schemaUrl = "";

                    /**
                     * Creates a new ResourceSpans instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ResourceSpans.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.trace.v1.ResourceSpans} ResourceSpans instance
                     * @type {{
                     *   (properties: opentelemetry.proto.trace.v1.ResourceSpans.$Shape): opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape;
                     *   (properties?: opentelemetry.proto.trace.v1.ResourceSpans.$Properties): opentelemetry.proto.trace.v1.ResourceSpans;
                     * }}
                     */
                    ResourceSpans.create = function(properties) {
                        return new ResourceSpans(properties);
                    };

                    /**
                     * Encodes the specified ResourceSpans message. Does not implicitly {@link opentelemetry.proto.trace.v1.ResourceSpans.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ResourceSpans.$Properties} message ResourceSpans message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ResourceSpans.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.resource != null && $Object.hasOwnProperty.call(message, "resource"))
                            $root.opentelemetry.proto.resource.v1.Resource.encode(message.resource, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.scopeSpans != null && message.scopeSpans.length)
                            for (let i = 0; i < message.scopeSpans.length; ++i)
                                $root.opentelemetry.proto.trace.v1.ScopeSpans.encode(message.scopeSpans[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl") && message.schemaUrl !== "")
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.schemaUrl);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified ResourceSpans message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.ResourceSpans.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ResourceSpans.$Properties} message ResourceSpans message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ResourceSpans.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a ResourceSpans message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape} ResourceSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ResourceSpans.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.trace.v1.ResourceSpans(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    message.resource = $root.opentelemetry.proto.resource.v1.Resource.decode(reader, reader.uint32(), $undefined, _depth + 1, message.resource);
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.scopeSpans && message.scopeSpans.length))
                                        message.scopeSpans = [];
                                    message.scopeSpans.push($root.opentelemetry.proto.trace.v1.ScopeSpans.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.schemaUrl = value;
                                    else
                                        delete message.schemaUrl;
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a ResourceSpans message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape} ResourceSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ResourceSpans.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ResourceSpans message.
                     * @function verify
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ResourceSpans.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.resource != null && $Object.hasOwnProperty.call(message, "resource")) {
                            let error = $root.opentelemetry.proto.resource.v1.Resource.verify(message.resource, _depth + 1);
                            if (error)
                                return "resource." + error;
                        }
                        if (message.scopeSpans != null && $Object.hasOwnProperty.call(message, "scopeSpans")) {
                            if (!$Array.isArray(message.scopeSpans))
                                return "scopeSpans: array expected";
                            for (let i = 0; i < message.scopeSpans.length; ++i) {
                                let error = $root.opentelemetry.proto.trace.v1.ScopeSpans.verify(message.scopeSpans[i], _depth + 1);
                                if (error)
                                    return "scopeSpans." + error;
                            }
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            if (!$util.isString(message.schemaUrl))
                                return "schemaUrl: string expected";
                        return null;
                    };

                    /**
                     * Creates a ResourceSpans message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.trace.v1.ResourceSpans} ResourceSpans
                     */
                    ResourceSpans.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.trace.v1.ResourceSpans)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.trace.v1.ResourceSpans: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.trace.v1.ResourceSpans();
                        if (object.resource != null) {
                            if (!$util.isObject(object.resource))
                                throw $TypeError(".opentelemetry.proto.trace.v1.ResourceSpans.resource: object expected");
                            message.resource = $root.opentelemetry.proto.resource.v1.Resource.fromObject(object.resource, _depth + 1);
                        }
                        if (object.scopeSpans) {
                            if (!$Array.isArray(object.scopeSpans))
                                throw $TypeError(".opentelemetry.proto.trace.v1.ResourceSpans.scopeSpans: array expected");
                            message.scopeSpans = $Array(object.scopeSpans.length);
                            for (let i = 0; i < object.scopeSpans.length; ++i) {
                                if (!$util.isObject(object.scopeSpans[i]))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.ResourceSpans.scopeSpans: object expected");
                                message.scopeSpans[i] = $root.opentelemetry.proto.trace.v1.ScopeSpans.fromObject(object.scopeSpans[i], _depth + 1);
                            }
                        }
                        if (object.schemaUrl != null)
                            if (typeof object.schemaUrl !== "string" || object.schemaUrl.length)
                                message.schemaUrl = $String(object.schemaUrl);
                        return message;
                    };

                    /**
                     * Creates a plain object from a ResourceSpans message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ResourceSpans} message ResourceSpans
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ResourceSpans.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.scopeSpans = [];
                        if (options.defaults) {
                            object.resource = null;
                            object.schemaUrl = "";
                        }
                        if (message.resource != null && $Object.hasOwnProperty.call(message, "resource"))
                            object.resource = $root.opentelemetry.proto.resource.v1.Resource.toObject(message.resource, options, _depth + 1);
                        if (message.scopeSpans && message.scopeSpans.length) {
                            object.scopeSpans = $Array(message.scopeSpans.length);
                            for (let j = 0; j < message.scopeSpans.length; ++j)
                                object.scopeSpans[j] = $root.opentelemetry.proto.trace.v1.ScopeSpans.toObject(message.scopeSpans[j], options, _depth + 1);
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            object.schemaUrl = message.schemaUrl;
                        return object;
                    };

                    /**
                     * Converts this ResourceSpans to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ResourceSpans.prototype.toJSON = function() {
                        return ResourceSpans.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for ResourceSpans
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.trace.v1.ResourceSpans
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    ResourceSpans.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.trace.v1.ResourceSpans";
                    };

                    return ResourceSpans;
                })();

                v1.ScopeSpans = (function() {

                    /**
                     * Properties of a ScopeSpans.
                     * @typedef {Object} opentelemetry.proto.trace.v1.ScopeSpans.$Properties
                     * @property {opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null} [scope] ScopeSpans scope
                     * @property {Array.<opentelemetry.proto.trace.v1.Span.$Properties>|null} [spans] ScopeSpans spans
                     * @property {string|null} [schemaUrl] ScopeSpans schemaUrl
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a ScopeSpans.
                     * @memberof opentelemetry.proto.trace.v1
                     * @interface IScopeSpans
                     * @augments opentelemetry.proto.trace.v1.ScopeSpans.$Properties
                     * @deprecated Use opentelemetry.proto.trace.v1.ScopeSpans.$Properties instead.
                     */

                    /**
                     * Shape of a ScopeSpans.
                     * @typedef {{
                     *   scope?: opentelemetry.proto.common.v1.InstrumentationScope.$Shape|null;
                     *   spans?: Array.<opentelemetry.proto.trace.v1.Span.$Shape>|null;
                     *   schemaUrl?: string|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.trace.v1.ScopeSpans.$Shape
                     */

                    /**
                     * Constructs a new ScopeSpans.
                     * @memberof opentelemetry.proto.trace.v1
                     * @classdesc Represents a ScopeSpans.
                     * @constructor
                     * @param {opentelemetry.proto.trace.v1.ScopeSpans.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const ScopeSpans = function (properties) {
                        this.spans = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * ScopeSpans scope.
                     * @member {opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null|undefined} scope
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @instance
                     */
                    ScopeSpans.prototype.scope = null;

                    /**
                     * ScopeSpans spans.
                     * @member {Array.<opentelemetry.proto.trace.v1.Span.$Properties>} spans
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @instance
                     */
                    ScopeSpans.prototype.spans = $util.emptyArray;

                    /**
                     * ScopeSpans schemaUrl.
                     * @member {string} schemaUrl
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @instance
                     */
                    ScopeSpans.prototype.schemaUrl = "";

                    /**
                     * Creates a new ScopeSpans instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ScopeSpans.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.trace.v1.ScopeSpans} ScopeSpans instance
                     * @type {{
                     *   (properties: opentelemetry.proto.trace.v1.ScopeSpans.$Shape): opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape;
                     *   (properties?: opentelemetry.proto.trace.v1.ScopeSpans.$Properties): opentelemetry.proto.trace.v1.ScopeSpans;
                     * }}
                     */
                    ScopeSpans.create = function(properties) {
                        return new ScopeSpans(properties);
                    };

                    /**
                     * Encodes the specified ScopeSpans message. Does not implicitly {@link opentelemetry.proto.trace.v1.ScopeSpans.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ScopeSpans.$Properties} message ScopeSpans message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ScopeSpans.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.scope != null && $Object.hasOwnProperty.call(message, "scope"))
                            $root.opentelemetry.proto.common.v1.InstrumentationScope.encode(message.scope, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.spans != null && message.spans.length)
                            for (let i = 0; i < message.spans.length; ++i)
                                $root.opentelemetry.proto.trace.v1.Span.encode(message.spans[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl") && message.schemaUrl !== "")
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.schemaUrl);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified ScopeSpans message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.ScopeSpans.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ScopeSpans.$Properties} message ScopeSpans message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ScopeSpans.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a ScopeSpans message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape} ScopeSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ScopeSpans.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.trace.v1.ScopeSpans(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    message.scope = $root.opentelemetry.proto.common.v1.InstrumentationScope.decode(reader, reader.uint32(), $undefined, _depth + 1, message.scope);
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.spans && message.spans.length))
                                        message.spans = [];
                                    message.spans.push($root.opentelemetry.proto.trace.v1.Span.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.schemaUrl = value;
                                    else
                                        delete message.schemaUrl;
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a ScopeSpans message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape} ScopeSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ScopeSpans.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ScopeSpans message.
                     * @function verify
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ScopeSpans.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.scope != null && $Object.hasOwnProperty.call(message, "scope")) {
                            let error = $root.opentelemetry.proto.common.v1.InstrumentationScope.verify(message.scope, _depth + 1);
                            if (error)
                                return "scope." + error;
                        }
                        if (message.spans != null && $Object.hasOwnProperty.call(message, "spans")) {
                            if (!$Array.isArray(message.spans))
                                return "spans: array expected";
                            for (let i = 0; i < message.spans.length; ++i) {
                                let error = $root.opentelemetry.proto.trace.v1.Span.verify(message.spans[i], _depth + 1);
                                if (error)
                                    return "spans." + error;
                            }
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            if (!$util.isString(message.schemaUrl))
                                return "schemaUrl: string expected";
                        return null;
                    };

                    /**
                     * Creates a ScopeSpans message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.trace.v1.ScopeSpans} ScopeSpans
                     */
                    ScopeSpans.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.trace.v1.ScopeSpans)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.trace.v1.ScopeSpans: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.trace.v1.ScopeSpans();
                        if (object.scope != null) {
                            if (!$util.isObject(object.scope))
                                throw $TypeError(".opentelemetry.proto.trace.v1.ScopeSpans.scope: object expected");
                            message.scope = $root.opentelemetry.proto.common.v1.InstrumentationScope.fromObject(object.scope, _depth + 1);
                        }
                        if (object.spans) {
                            if (!$Array.isArray(object.spans))
                                throw $TypeError(".opentelemetry.proto.trace.v1.ScopeSpans.spans: array expected");
                            message.spans = $Array(object.spans.length);
                            for (let i = 0; i < object.spans.length; ++i) {
                                if (!$util.isObject(object.spans[i]))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.ScopeSpans.spans: object expected");
                                message.spans[i] = $root.opentelemetry.proto.trace.v1.Span.fromObject(object.spans[i], _depth + 1);
                            }
                        }
                        if (object.schemaUrl != null)
                            if (typeof object.schemaUrl !== "string" || object.schemaUrl.length)
                                message.schemaUrl = $String(object.schemaUrl);
                        return message;
                    };

                    /**
                     * Creates a plain object from a ScopeSpans message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {opentelemetry.proto.trace.v1.ScopeSpans} message ScopeSpans
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ScopeSpans.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.spans = [];
                        if (options.defaults) {
                            object.scope = null;
                            object.schemaUrl = "";
                        }
                        if (message.scope != null && $Object.hasOwnProperty.call(message, "scope"))
                            object.scope = $root.opentelemetry.proto.common.v1.InstrumentationScope.toObject(message.scope, options, _depth + 1);
                        if (message.spans && message.spans.length) {
                            object.spans = $Array(message.spans.length);
                            for (let j = 0; j < message.spans.length; ++j)
                                object.spans[j] = $root.opentelemetry.proto.trace.v1.Span.toObject(message.spans[j], options, _depth + 1);
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            object.schemaUrl = message.schemaUrl;
                        return object;
                    };

                    /**
                     * Converts this ScopeSpans to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ScopeSpans.prototype.toJSON = function() {
                        return ScopeSpans.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for ScopeSpans
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.trace.v1.ScopeSpans
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    ScopeSpans.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.trace.v1.ScopeSpans";
                    };

                    return ScopeSpans;
                })();

                v1.Span = (function() {

                    /**
                     * Properties of a Span.
                     * @typedef {Object} opentelemetry.proto.trace.v1.Span.$Properties
                     * @property {Uint8Array|null} [traceId] Span traceId
                     * @property {Uint8Array|null} [spanId] Span spanId
                     * @property {string|null} [traceState] Span traceState
                     * @property {Uint8Array|null} [parentSpanId] Span parentSpanId
                     * @property {number|null} [flags] Span flags
                     * @property {string|null} [name] Span name
                     * @property {opentelemetry.proto.trace.v1.Span.SpanKind|null} [kind] Span kind
                     * @property {number|Long|null} [startTimeUnixNano] Span startTimeUnixNano
                     * @property {number|Long|null} [endTimeUnixNano] Span endTimeUnixNano
                     * @property {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>|null} [attributes] Span attributes
                     * @property {number|null} [droppedAttributesCount] Span droppedAttributesCount
                     * @property {Array.<opentelemetry.proto.trace.v1.Span.Event.$Properties>|null} [events] Span events
                     * @property {number|null} [droppedEventsCount] Span droppedEventsCount
                     * @property {Array.<opentelemetry.proto.trace.v1.Span.Link.$Properties>|null} [links] Span links
                     * @property {number|null} [droppedLinksCount] Span droppedLinksCount
                     * @property {opentelemetry.proto.trace.v1.Status.$Properties|null} [status] Span status
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a Span.
                     * @memberof opentelemetry.proto.trace.v1
                     * @interface ISpan
                     * @augments opentelemetry.proto.trace.v1.Span.$Properties
                     * @deprecated Use opentelemetry.proto.trace.v1.Span.$Properties instead.
                     */

                    /**
                     * Shape of a Span.
                     * @typedef {{
                     *   traceId?: Uint8Array|null;
                     *   spanId?: Uint8Array|null;
                     *   traceState?: string|null;
                     *   parentSpanId?: Uint8Array|null;
                     *   flags?: number|null;
                     *   name?: string|null;
                     *   kind?: opentelemetry.proto.trace.v1.Span.SpanKind|null;
                     *   startTimeUnixNano?: number|Long|null;
                     *   endTimeUnixNano?: number|Long|null;
                     *   attributes?: Array.<opentelemetry.proto.common.v1.KeyValue.$Shape>|null;
                     *   droppedAttributesCount?: number|null;
                     *   events?: Array.<opentelemetry.proto.trace.v1.Span.Event.$Shape>|null;
                     *   droppedEventsCount?: number|null;
                     *   links?: Array.<opentelemetry.proto.trace.v1.Span.Link.$Shape>|null;
                     *   droppedLinksCount?: number|null;
                     *   status?: opentelemetry.proto.trace.v1.Status.$Shape|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.trace.v1.Span.$Shape
                     */

                    /**
                     * Constructs a new Span.
                     * @memberof opentelemetry.proto.trace.v1
                     * @classdesc Represents a Span.
                     * @constructor
                     * @param {opentelemetry.proto.trace.v1.Span.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const Span = function (properties) {
                        this.attributes = [];
                        this.events = [];
                        this.links = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * Span traceId.
                     * @member {Uint8Array} traceId
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.traceId = $util.newBuffer([]);

                    /**
                     * Span spanId.
                     * @member {Uint8Array} spanId
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.spanId = $util.newBuffer([]);

                    /**
                     * Span traceState.
                     * @member {string} traceState
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.traceState = "";

                    /**
                     * Span parentSpanId.
                     * @member {Uint8Array} parentSpanId
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.parentSpanId = $util.newBuffer([]);

                    /**
                     * Span flags.
                     * @member {number} flags
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.flags = 0;

                    /**
                     * Span name.
                     * @member {string} name
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.name = "";

                    /**
                     * Span kind.
                     * @member {opentelemetry.proto.trace.v1.Span.SpanKind} kind
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.kind = 0;

                    /**
                     * Span startTimeUnixNano.
                     * @member {number|Long} startTimeUnixNano
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.startTimeUnixNano = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                    /**
                     * Span endTimeUnixNano.
                     * @member {number|Long} endTimeUnixNano
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.endTimeUnixNano = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                    /**
                     * Span attributes.
                     * @member {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>} attributes
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.attributes = $util.emptyArray;

                    /**
                     * Span droppedAttributesCount.
                     * @member {number} droppedAttributesCount
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.droppedAttributesCount = 0;

                    /**
                     * Span events.
                     * @member {Array.<opentelemetry.proto.trace.v1.Span.Event.$Properties>} events
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.events = $util.emptyArray;

                    /**
                     * Span droppedEventsCount.
                     * @member {number} droppedEventsCount
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.droppedEventsCount = 0;

                    /**
                     * Span links.
                     * @member {Array.<opentelemetry.proto.trace.v1.Span.Link.$Properties>} links
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.links = $util.emptyArray;

                    /**
                     * Span droppedLinksCount.
                     * @member {number} droppedLinksCount
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.droppedLinksCount = 0;

                    /**
                     * Span status.
                     * @member {opentelemetry.proto.trace.v1.Status.$Properties|null|undefined} status
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     */
                    Span.prototype.status = null;

                    /**
                     * Creates a new Span instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Span.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.trace.v1.Span} Span instance
                     * @type {{
                     *   (properties: opentelemetry.proto.trace.v1.Span.$Shape): opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape;
                     *   (properties?: opentelemetry.proto.trace.v1.Span.$Properties): opentelemetry.proto.trace.v1.Span;
                     * }}
                     */
                    Span.create = function(properties) {
                        return new Span(properties);
                    };

                    /**
                     * Encodes the specified Span message. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Span.$Properties} message Span message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Span.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId") && message.traceId.length)
                            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.traceId);
                        if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId") && message.spanId.length)
                            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.spanId);
                        if (message.traceState != null && $Object.hasOwnProperty.call(message, "traceState") && message.traceState !== "")
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.traceState);
                        if (message.parentSpanId != null && $Object.hasOwnProperty.call(message, "parentSpanId") && message.parentSpanId.length)
                            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.parentSpanId);
                        if (message.name != null && $Object.hasOwnProperty.call(message, "name") && message.name !== "")
                            writer.uint32(/* id 5, wireType 2 =*/42).string(message.name);
                        if (message.kind != null && $Object.hasOwnProperty.call(message, "kind") && message.kind !== 0)
                            writer.uint32(/* id 6, wireType 0 =*/48).int32(message.kind);
                        if (message.startTimeUnixNano != null && $Object.hasOwnProperty.call(message, "startTimeUnixNano") && (typeof message.startTimeUnixNano === "object" ? message.startTimeUnixNano.low || message.startTimeUnixNano.high : message.startTimeUnixNano !== 0))
                            writer.uint32(/* id 7, wireType 1 =*/57).fixed64(message.startTimeUnixNano);
                        if (message.endTimeUnixNano != null && $Object.hasOwnProperty.call(message, "endTimeUnixNano") && (typeof message.endTimeUnixNano === "object" ? message.endTimeUnixNano.low || message.endTimeUnixNano.high : message.endTimeUnixNano !== 0))
                            writer.uint32(/* id 8, wireType 1 =*/65).fixed64(message.endTimeUnixNano);
                        if (message.attributes != null && message.attributes.length)
                            for (let i = 0; i < message.attributes.length; ++i)
                                $root.opentelemetry.proto.common.v1.KeyValue.encode(message.attributes[i], writer.uint32(/* id 9, wireType 2 =*/74).fork(), _depth + 1).ldelim();
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount") && message.droppedAttributesCount !== 0)
                            writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.droppedAttributesCount);
                        if (message.events != null && message.events.length)
                            for (let i = 0; i < message.events.length; ++i)
                                $root.opentelemetry.proto.trace.v1.Span.Event.encode(message.events[i], writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
                        if (message.droppedEventsCount != null && $Object.hasOwnProperty.call(message, "droppedEventsCount") && message.droppedEventsCount !== 0)
                            writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.droppedEventsCount);
                        if (message.links != null && message.links.length)
                            for (let i = 0; i < message.links.length; ++i)
                                $root.opentelemetry.proto.trace.v1.Span.Link.encode(message.links[i], writer.uint32(/* id 13, wireType 2 =*/106).fork(), _depth + 1).ldelim();
                        if (message.droppedLinksCount != null && $Object.hasOwnProperty.call(message, "droppedLinksCount") && message.droppedLinksCount !== 0)
                            writer.uint32(/* id 14, wireType 0 =*/112).uint32(message.droppedLinksCount);
                        if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                            $root.opentelemetry.proto.trace.v1.Status.encode(message.status, writer.uint32(/* id 15, wireType 2 =*/122).fork(), _depth + 1).ldelim();
                        if (message.flags != null && $Object.hasOwnProperty.call(message, "flags") && message.flags !== 0)
                            writer.uint32(/* id 16, wireType 5 =*/133).fixed32(message.flags);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified Span message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Span.$Properties} message Span message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Span.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a Span message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape} Span
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Span.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.trace.v1.Span(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.bytes()).length)
                                        message.traceId = value;
                                    else
                                        delete message.traceId;
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.bytes()).length)
                                        message.spanId = value;
                                    else
                                        delete message.spanId;
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.traceState = value;
                                    else
                                        delete message.traceState;
                                    continue;
                                }
                            case 4: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.bytes()).length)
                                        message.parentSpanId = value;
                                    else
                                        delete message.parentSpanId;
                                    continue;
                                }
                            case 16: {
                                    if (wireType !== 5)
                                        break;
                                    if (value = reader.fixed32())
                                        message.flags = value;
                                    else
                                        delete message.flags;
                                    continue;
                                }
                            case 5: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.name = value;
                                    else
                                        delete message.name;
                                    continue;
                                }
                            case 6: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.int32())
                                        message.kind = value;
                                    else
                                        delete message.kind;
                                    continue;
                                }
                            case 7: {
                                    if (wireType !== 1)
                                        break;
                                    if (typeof (value = reader.fixed64()) === "object" ? value.low || value.high : value !== 0)
                                        message.startTimeUnixNano = value;
                                    else
                                        delete message.startTimeUnixNano;
                                    continue;
                                }
                            case 8: {
                                    if (wireType !== 1)
                                        break;
                                    if (typeof (value = reader.fixed64()) === "object" ? value.low || value.high : value !== 0)
                                        message.endTimeUnixNano = value;
                                    else
                                        delete message.endTimeUnixNano;
                                    continue;
                                }
                            case 9: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.attributes && message.attributes.length))
                                        message.attributes = [];
                                    message.attributes.push($root.opentelemetry.proto.common.v1.KeyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 10: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.uint32())
                                        message.droppedAttributesCount = value;
                                    else
                                        delete message.droppedAttributesCount;
                                    continue;
                                }
                            case 11: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.events && message.events.length))
                                        message.events = [];
                                    message.events.push($root.opentelemetry.proto.trace.v1.Span.Event.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 12: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.uint32())
                                        message.droppedEventsCount = value;
                                    else
                                        delete message.droppedEventsCount;
                                    continue;
                                }
                            case 13: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.links && message.links.length))
                                        message.links = [];
                                    message.links.push($root.opentelemetry.proto.trace.v1.Span.Link.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 14: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.uint32())
                                        message.droppedLinksCount = value;
                                    else
                                        delete message.droppedLinksCount;
                                    continue;
                                }
                            case 15: {
                                    if (wireType !== 2)
                                        break;
                                    message.status = $root.opentelemetry.proto.trace.v1.Status.decode(reader, reader.uint32(), $undefined, _depth + 1, message.status);
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a Span message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape} Span
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Span.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Span message.
                     * @function verify
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Span.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId"))
                            if (!(message.traceId && typeof message.traceId.length === "number" || $util.isString(message.traceId)))
                                return "traceId: buffer expected";
                        if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId"))
                            if (!(message.spanId && typeof message.spanId.length === "number" || $util.isString(message.spanId)))
                                return "spanId: buffer expected";
                        if (message.traceState != null && $Object.hasOwnProperty.call(message, "traceState"))
                            if (!$util.isString(message.traceState))
                                return "traceState: string expected";
                        if (message.parentSpanId != null && $Object.hasOwnProperty.call(message, "parentSpanId"))
                            if (!(message.parentSpanId && typeof message.parentSpanId.length === "number" || $util.isString(message.parentSpanId)))
                                return "parentSpanId: buffer expected";
                        if (message.flags != null && $Object.hasOwnProperty.call(message, "flags"))
                            if (!$util.isInteger(message.flags))
                                return "flags: integer expected";
                        if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.kind != null && $Object.hasOwnProperty.call(message, "kind"))
                            if (typeof message.kind !== "number" || (message.kind | 0) !== message.kind)
                                return "kind: enum value expected";
                        if (message.startTimeUnixNano != null && $Object.hasOwnProperty.call(message, "startTimeUnixNano"))
                            if (!$util.isInteger(message.startTimeUnixNano) && !(message.startTimeUnixNano && $util.isInteger(message.startTimeUnixNano.low) && $util.isInteger(message.startTimeUnixNano.high)))
                                return "startTimeUnixNano: integer|Long expected";
                        if (message.endTimeUnixNano != null && $Object.hasOwnProperty.call(message, "endTimeUnixNano"))
                            if (!$util.isInteger(message.endTimeUnixNano) && !(message.endTimeUnixNano && $util.isInteger(message.endTimeUnixNano.low) && $util.isInteger(message.endTimeUnixNano.high)))
                                return "endTimeUnixNano: integer|Long expected";
                        if (message.attributes != null && $Object.hasOwnProperty.call(message, "attributes")) {
                            if (!$Array.isArray(message.attributes))
                                return "attributes: array expected";
                            for (let i = 0; i < message.attributes.length; ++i) {
                                let error = $root.opentelemetry.proto.common.v1.KeyValue.verify(message.attributes[i], _depth + 1);
                                if (error)
                                    return "attributes." + error;
                            }
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            if (!$util.isInteger(message.droppedAttributesCount))
                                return "droppedAttributesCount: integer expected";
                        if (message.events != null && $Object.hasOwnProperty.call(message, "events")) {
                            if (!$Array.isArray(message.events))
                                return "events: array expected";
                            for (let i = 0; i < message.events.length; ++i) {
                                let error = $root.opentelemetry.proto.trace.v1.Span.Event.verify(message.events[i], _depth + 1);
                                if (error)
                                    return "events." + error;
                            }
                        }
                        if (message.droppedEventsCount != null && $Object.hasOwnProperty.call(message, "droppedEventsCount"))
                            if (!$util.isInteger(message.droppedEventsCount))
                                return "droppedEventsCount: integer expected";
                        if (message.links != null && $Object.hasOwnProperty.call(message, "links")) {
                            if (!$Array.isArray(message.links))
                                return "links: array expected";
                            for (let i = 0; i < message.links.length; ++i) {
                                let error = $root.opentelemetry.proto.trace.v1.Span.Link.verify(message.links[i], _depth + 1);
                                if (error)
                                    return "links." + error;
                            }
                        }
                        if (message.droppedLinksCount != null && $Object.hasOwnProperty.call(message, "droppedLinksCount"))
                            if (!$util.isInteger(message.droppedLinksCount))
                                return "droppedLinksCount: integer expected";
                        if (message.status != null && $Object.hasOwnProperty.call(message, "status")) {
                            let error = $root.opentelemetry.proto.trace.v1.Status.verify(message.status, _depth + 1);
                            if (error)
                                return "status." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a Span message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.trace.v1.Span} Span
                     */
                    Span.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.trace.v1.Span)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.trace.v1.Span: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.trace.v1.Span();
                        if (object.traceId != null)
                            if (object.traceId.length)
                                if (typeof object.traceId === "string")
                                    $util.base64.decode(object.traceId, message.traceId = $util.newBuffer($util.base64.length(object.traceId)), 0);
                                else if (object.traceId.length >= 0)
                                    message.traceId = object.traceId;
                        if (object.spanId != null)
                            if (object.spanId.length)
                                if (typeof object.spanId === "string")
                                    $util.base64.decode(object.spanId, message.spanId = $util.newBuffer($util.base64.length(object.spanId)), 0);
                                else if (object.spanId.length >= 0)
                                    message.spanId = object.spanId;
                        if (object.traceState != null)
                            if (typeof object.traceState !== "string" || object.traceState.length)
                                message.traceState = $String(object.traceState);
                        if (object.parentSpanId != null)
                            if (object.parentSpanId.length)
                                if (typeof object.parentSpanId === "string")
                                    $util.base64.decode(object.parentSpanId, message.parentSpanId = $util.newBuffer($util.base64.length(object.parentSpanId)), 0);
                                else if (object.parentSpanId.length >= 0)
                                    message.parentSpanId = object.parentSpanId;
                        if (object.flags != null)
                            if ($Number(object.flags) !== 0)
                                message.flags = object.flags >>> 0;
                        if (object.name != null)
                            if (typeof object.name !== "string" || object.name.length)
                                message.name = $String(object.name);
                        if (object.kind !== 0 && (typeof object.kind !== "string" || $root.opentelemetry.proto.trace.v1.Span.SpanKind[object.kind] !== 0))
                            switch (object.kind) {
                            case "SPAN_KIND_UNSPECIFIED":
                            case 0:
                                message.kind = 0;
                                break;
                            case "SPAN_KIND_INTERNAL":
                            case 1:
                                message.kind = 1;
                                break;
                            case "SPAN_KIND_SERVER":
                            case 2:
                                message.kind = 2;
                                break;
                            case "SPAN_KIND_CLIENT":
                            case 3:
                                message.kind = 3;
                                break;
                            case "SPAN_KIND_PRODUCER":
                            case 4:
                                message.kind = 4;
                                break;
                            case "SPAN_KIND_CONSUMER":
                            case 5:
                                message.kind = 5;
                                break;
                            default:
                                if (typeof object.kind === "number" && (object.kind | 0) === object.kind)
                                    message.kind = object.kind;
                            }
                        if (object.startTimeUnixNano != null)
                            if (typeof object.startTimeUnixNano === "object" ? object.startTimeUnixNano.low || object.startTimeUnixNano.high : $Number(object.startTimeUnixNano) !== 0)
                                if ($util.Long)
                                    message.startTimeUnixNano = $util.Long.fromValue(object.startTimeUnixNano, true);
                                else if (typeof object.startTimeUnixNano === "string")
                                    message.startTimeUnixNano = $parseInt(object.startTimeUnixNano, 10);
                                else if (typeof object.startTimeUnixNano === "number")
                                    message.startTimeUnixNano = object.startTimeUnixNano;
                                else if (typeof object.startTimeUnixNano === "object")
                                    message.startTimeUnixNano = new $util.LongBits(object.startTimeUnixNano.low >>> 0, object.startTimeUnixNano.high >>> 0).toNumber(true);
                        if (object.endTimeUnixNano != null)
                            if (typeof object.endTimeUnixNano === "object" ? object.endTimeUnixNano.low || object.endTimeUnixNano.high : $Number(object.endTimeUnixNano) !== 0)
                                if ($util.Long)
                                    message.endTimeUnixNano = $util.Long.fromValue(object.endTimeUnixNano, true);
                                else if (typeof object.endTimeUnixNano === "string")
                                    message.endTimeUnixNano = $parseInt(object.endTimeUnixNano, 10);
                                else if (typeof object.endTimeUnixNano === "number")
                                    message.endTimeUnixNano = object.endTimeUnixNano;
                                else if (typeof object.endTimeUnixNano === "object")
                                    message.endTimeUnixNano = new $util.LongBits(object.endTimeUnixNano.low >>> 0, object.endTimeUnixNano.high >>> 0).toNumber(true);
                        if (object.attributes) {
                            if (!$Array.isArray(object.attributes))
                                throw $TypeError(".opentelemetry.proto.trace.v1.Span.attributes: array expected");
                            message.attributes = $Array(object.attributes.length);
                            for (let i = 0; i < object.attributes.length; ++i) {
                                if (!$util.isObject(object.attributes[i]))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.Span.attributes: object expected");
                                message.attributes[i] = $root.opentelemetry.proto.common.v1.KeyValue.fromObject(object.attributes[i], _depth + 1);
                            }
                        }
                        if (object.droppedAttributesCount != null)
                            if ($Number(object.droppedAttributesCount) !== 0)
                                message.droppedAttributesCount = object.droppedAttributesCount >>> 0;
                        if (object.events) {
                            if (!$Array.isArray(object.events))
                                throw $TypeError(".opentelemetry.proto.trace.v1.Span.events: array expected");
                            message.events = $Array(object.events.length);
                            for (let i = 0; i < object.events.length; ++i) {
                                if (!$util.isObject(object.events[i]))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.Span.events: object expected");
                                message.events[i] = $root.opentelemetry.proto.trace.v1.Span.Event.fromObject(object.events[i], _depth + 1);
                            }
                        }
                        if (object.droppedEventsCount != null)
                            if ($Number(object.droppedEventsCount) !== 0)
                                message.droppedEventsCount = object.droppedEventsCount >>> 0;
                        if (object.links) {
                            if (!$Array.isArray(object.links))
                                throw $TypeError(".opentelemetry.proto.trace.v1.Span.links: array expected");
                            message.links = $Array(object.links.length);
                            for (let i = 0; i < object.links.length; ++i) {
                                if (!$util.isObject(object.links[i]))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.Span.links: object expected");
                                message.links[i] = $root.opentelemetry.proto.trace.v1.Span.Link.fromObject(object.links[i], _depth + 1);
                            }
                        }
                        if (object.droppedLinksCount != null)
                            if ($Number(object.droppedLinksCount) !== 0)
                                message.droppedLinksCount = object.droppedLinksCount >>> 0;
                        if (object.status != null) {
                            if (!$util.isObject(object.status))
                                throw $TypeError(".opentelemetry.proto.trace.v1.Span.status: object expected");
                            message.status = $root.opentelemetry.proto.trace.v1.Status.fromObject(object.status, _depth + 1);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Span message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Span} message Span
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Span.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults) {
                            object.attributes = [];
                            object.events = [];
                            object.links = [];
                        }
                        if (options.defaults) {
                            if (options.bytes === $String)
                                object.traceId = "";
                            else {
                                object.traceId = [];
                                if (options.bytes !== $Array)
                                    object.traceId = $util.newBuffer(object.traceId);
                            }
                            if (options.bytes === $String)
                                object.spanId = "";
                            else {
                                object.spanId = [];
                                if (options.bytes !== $Array)
                                    object.spanId = $util.newBuffer(object.spanId);
                            }
                            object.traceState = "";
                            if (options.bytes === $String)
                                object.parentSpanId = "";
                            else {
                                object.parentSpanId = [];
                                if (options.bytes !== $Array)
                                    object.parentSpanId = $util.newBuffer(object.parentSpanId);
                            }
                            object.name = "";
                            object.kind = options.enums === $String ? "SPAN_KIND_UNSPECIFIED" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, true);
                                object.startTimeUnixNano = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                            } else
                                object.startTimeUnixNano = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, true);
                                object.endTimeUnixNano = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                            } else
                                object.endTimeUnixNano = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                            object.droppedAttributesCount = 0;
                            object.droppedEventsCount = 0;
                            object.droppedLinksCount = 0;
                            object.status = null;
                            object.flags = 0;
                        }
                        if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId"))
                            object.traceId = options.bytes === $String ? $util.base64.encode(message.traceId, 0, message.traceId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.traceId) : message.traceId;
                        if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId"))
                            object.spanId = options.bytes === $String ? $util.base64.encode(message.spanId, 0, message.spanId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.spanId) : message.spanId;
                        if (message.traceState != null && $Object.hasOwnProperty.call(message, "traceState"))
                            object.traceState = message.traceState;
                        if (message.parentSpanId != null && $Object.hasOwnProperty.call(message, "parentSpanId"))
                            object.parentSpanId = options.bytes === $String ? $util.base64.encode(message.parentSpanId, 0, message.parentSpanId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.parentSpanId) : message.parentSpanId;
                        if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                            object.name = message.name;
                        if (message.kind != null && $Object.hasOwnProperty.call(message, "kind"))
                            object.kind = options.enums === $String ? $root.opentelemetry.proto.trace.v1.Span.SpanKind[message.kind] === $undefined ? message.kind : $root.opentelemetry.proto.trace.v1.Span.SpanKind[message.kind] : message.kind;
                        if (message.startTimeUnixNano != null && $Object.hasOwnProperty.call(message, "startTimeUnixNano"))
                            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                object.startTimeUnixNano = typeof message.startTimeUnixNano === "number" ? $BigInt(message.startTimeUnixNano) : $util.Long.fromBits(message.startTimeUnixNano.low >>> 0, message.startTimeUnixNano.high >>> 0, true).toBigInt();
                            else if (typeof message.startTimeUnixNano === "number")
                                object.startTimeUnixNano = options.longs === $String ? $String(message.startTimeUnixNano) : message.startTimeUnixNano;
                            else
                                object.startTimeUnixNano = options.longs === $String ? $util.Long.prototype.toString.call(message.startTimeUnixNano) : options.longs === $Number ? new $util.LongBits(message.startTimeUnixNano.low >>> 0, message.startTimeUnixNano.high >>> 0).toNumber(true) : message.startTimeUnixNano;
                        if (message.endTimeUnixNano != null && $Object.hasOwnProperty.call(message, "endTimeUnixNano"))
                            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                object.endTimeUnixNano = typeof message.endTimeUnixNano === "number" ? $BigInt(message.endTimeUnixNano) : $util.Long.fromBits(message.endTimeUnixNano.low >>> 0, message.endTimeUnixNano.high >>> 0, true).toBigInt();
                            else if (typeof message.endTimeUnixNano === "number")
                                object.endTimeUnixNano = options.longs === $String ? $String(message.endTimeUnixNano) : message.endTimeUnixNano;
                            else
                                object.endTimeUnixNano = options.longs === $String ? $util.Long.prototype.toString.call(message.endTimeUnixNano) : options.longs === $Number ? new $util.LongBits(message.endTimeUnixNano.low >>> 0, message.endTimeUnixNano.high >>> 0).toNumber(true) : message.endTimeUnixNano;
                        if (message.attributes && message.attributes.length) {
                            object.attributes = $Array(message.attributes.length);
                            for (let j = 0; j < message.attributes.length; ++j)
                                object.attributes[j] = $root.opentelemetry.proto.common.v1.KeyValue.toObject(message.attributes[j], options, _depth + 1);
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            object.droppedAttributesCount = message.droppedAttributesCount;
                        if (message.events && message.events.length) {
                            object.events = $Array(message.events.length);
                            for (let j = 0; j < message.events.length; ++j)
                                object.events[j] = $root.opentelemetry.proto.trace.v1.Span.Event.toObject(message.events[j], options, _depth + 1);
                        }
                        if (message.droppedEventsCount != null && $Object.hasOwnProperty.call(message, "droppedEventsCount"))
                            object.droppedEventsCount = message.droppedEventsCount;
                        if (message.links && message.links.length) {
                            object.links = $Array(message.links.length);
                            for (let j = 0; j < message.links.length; ++j)
                                object.links[j] = $root.opentelemetry.proto.trace.v1.Span.Link.toObject(message.links[j], options, _depth + 1);
                        }
                        if (message.droppedLinksCount != null && $Object.hasOwnProperty.call(message, "droppedLinksCount"))
                            object.droppedLinksCount = message.droppedLinksCount;
                        if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                            object.status = $root.opentelemetry.proto.trace.v1.Status.toObject(message.status, options, _depth + 1);
                        if (message.flags != null && $Object.hasOwnProperty.call(message, "flags"))
                            object.flags = message.flags;
                        return object;
                    };

                    /**
                     * Converts this Span to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Span.prototype.toJSON = function() {
                        return Span.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for Span
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.trace.v1.Span
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    Span.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.trace.v1.Span";
                    };

                    /**
                     * SpanKind enum.
                     * @name opentelemetry.proto.trace.v1.Span.SpanKind
                     * @enum {number}
                     * @property {number} SPAN_KIND_UNSPECIFIED=0 SPAN_KIND_UNSPECIFIED value
                     * @property {number} SPAN_KIND_INTERNAL=1 SPAN_KIND_INTERNAL value
                     * @property {number} SPAN_KIND_SERVER=2 SPAN_KIND_SERVER value
                     * @property {number} SPAN_KIND_CLIENT=3 SPAN_KIND_CLIENT value
                     * @property {number} SPAN_KIND_PRODUCER=4 SPAN_KIND_PRODUCER value
                     * @property {number} SPAN_KIND_CONSUMER=5 SPAN_KIND_CONSUMER value
                     */
                    Span.SpanKind = (function() {
                        const valuesById = $Object.create(null), values = $Object.create(valuesById);
                        values[valuesById[0] = "SPAN_KIND_UNSPECIFIED"] = 0;
                        values[valuesById[1] = "SPAN_KIND_INTERNAL"] = 1;
                        values[valuesById[2] = "SPAN_KIND_SERVER"] = 2;
                        values[valuesById[3] = "SPAN_KIND_CLIENT"] = 3;
                        values[valuesById[4] = "SPAN_KIND_PRODUCER"] = 4;
                        values[valuesById[5] = "SPAN_KIND_CONSUMER"] = 5;
                        return values;
                    })();

                    Span.Event = (function() {

                        /**
                         * Properties of an Event.
                         * @typedef {Object} opentelemetry.proto.trace.v1.Span.Event.$Properties
                         * @property {number|Long|null} [timeUnixNano] Event timeUnixNano
                         * @property {string|null} [name] Event name
                         * @property {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>|null} [attributes] Event attributes
                         * @property {number|null} [droppedAttributesCount] Event droppedAttributesCount
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of an Event.
                         * @memberof opentelemetry.proto.trace.v1.Span
                         * @interface IEvent
                         * @augments opentelemetry.proto.trace.v1.Span.Event.$Properties
                         * @deprecated Use opentelemetry.proto.trace.v1.Span.Event.$Properties instead.
                         */

                        /**
                         * Shape of an Event.
                         * @typedef {{
                         *   timeUnixNano?: number|Long|null;
                         *   name?: string|null;
                         *   attributes?: Array.<opentelemetry.proto.common.v1.KeyValue.$Shape>|null;
                         *   droppedAttributesCount?: number|null;
                         *   $unknowns?: Array.<Uint8Array>;
                         * }} opentelemetry.proto.trace.v1.Span.Event.$Shape
                         */

                        /**
                         * Constructs a new Event.
                         * @memberof opentelemetry.proto.trace.v1.Span
                         * @classdesc Represents an Event.
                         * @constructor
                         * @param {opentelemetry.proto.trace.v1.Span.Event.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const Event = function (properties) {
                            this.attributes = [];
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * Event timeUnixNano.
                         * @member {number|Long} timeUnixNano
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @instance
                         */
                        Event.prototype.timeUnixNano = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                        /**
                         * Event name.
                         * @member {string} name
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @instance
                         */
                        Event.prototype.name = "";

                        /**
                         * Event attributes.
                         * @member {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>} attributes
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @instance
                         */
                        Event.prototype.attributes = $util.emptyArray;

                        /**
                         * Event droppedAttributesCount.
                         * @member {number} droppedAttributesCount
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @instance
                         */
                        Event.prototype.droppedAttributesCount = 0;

                        /**
                         * Creates a new Event instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Event.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.trace.v1.Span.Event} Event instance
                         * @type {{
                         *   (properties: opentelemetry.proto.trace.v1.Span.Event.$Shape): opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape;
                         *   (properties?: opentelemetry.proto.trace.v1.Span.Event.$Properties): opentelemetry.proto.trace.v1.Span.Event;
                         * }}
                         */
                        Event.create = function(properties) {
                            return new Event(properties);
                        };

                        /**
                         * Encodes the specified Event message. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Event.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Event.$Properties} message Event message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        Event.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.timeUnixNano != null && $Object.hasOwnProperty.call(message, "timeUnixNano") && (typeof message.timeUnixNano === "object" ? message.timeUnixNano.low || message.timeUnixNano.high : message.timeUnixNano !== 0))
                                writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.timeUnixNano);
                            if (message.name != null && $Object.hasOwnProperty.call(message, "name") && message.name !== "")
                                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                            if (message.attributes != null && message.attributes.length)
                                for (let i = 0; i < message.attributes.length; ++i)
                                    $root.opentelemetry.proto.common.v1.KeyValue.encode(message.attributes[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                            if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount") && message.droppedAttributesCount !== 0)
                                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.droppedAttributesCount);
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified Event message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Event.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Event.$Properties} message Event message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        Event.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes an Event message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape} Event
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        Event.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.trace.v1.Span.Event(), value;
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 1)
                                            break;
                                        if (typeof (value = reader.fixed64()) === "object" ? value.low || value.high : value !== 0)
                                            message.timeUnixNano = value;
                                        else
                                            delete message.timeUnixNano;
                                        continue;
                                    }
                                case 2: {
                                        if (wireType !== 2)
                                            break;
                                        if ((value = reader.stringVerify()).length)
                                            message.name = value;
                                        else
                                            delete message.name;
                                        continue;
                                    }
                                case 3: {
                                        if (wireType !== 2)
                                            break;
                                        if (!(message.attributes && message.attributes.length))
                                            message.attributes = [];
                                        message.attributes.push($root.opentelemetry.proto.common.v1.KeyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                        continue;
                                    }
                                case 4: {
                                        if (wireType !== 0)
                                            break;
                                        if (value = reader.uint32())
                                            message.droppedAttributesCount = value;
                                        else
                                            delete message.droppedAttributesCount;
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes an Event message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape} Event
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        Event.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an Event message.
                         * @function verify
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        Event.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.timeUnixNano != null && $Object.hasOwnProperty.call(message, "timeUnixNano"))
                                if (!$util.isInteger(message.timeUnixNano) && !(message.timeUnixNano && $util.isInteger(message.timeUnixNano.low) && $util.isInteger(message.timeUnixNano.high)))
                                    return "timeUnixNano: integer|Long expected";
                            if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                                if (!$util.isString(message.name))
                                    return "name: string expected";
                            if (message.attributes != null && $Object.hasOwnProperty.call(message, "attributes")) {
                                if (!$Array.isArray(message.attributes))
                                    return "attributes: array expected";
                                for (let i = 0; i < message.attributes.length; ++i) {
                                    let error = $root.opentelemetry.proto.common.v1.KeyValue.verify(message.attributes[i], _depth + 1);
                                    if (error)
                                        return "attributes." + error;
                                }
                            }
                            if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                                if (!$util.isInteger(message.droppedAttributesCount))
                                    return "droppedAttributesCount: integer expected";
                            return null;
                        };

                        /**
                         * Creates an Event message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.trace.v1.Span.Event} Event
                         */
                        Event.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.trace.v1.Span.Event)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.trace.v1.Span.Event: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.trace.v1.Span.Event();
                            if (object.timeUnixNano != null)
                                if (typeof object.timeUnixNano === "object" ? object.timeUnixNano.low || object.timeUnixNano.high : $Number(object.timeUnixNano) !== 0)
                                    if ($util.Long)
                                        message.timeUnixNano = $util.Long.fromValue(object.timeUnixNano, true);
                                    else if (typeof object.timeUnixNano === "string")
                                        message.timeUnixNano = $parseInt(object.timeUnixNano, 10);
                                    else if (typeof object.timeUnixNano === "number")
                                        message.timeUnixNano = object.timeUnixNano;
                                    else if (typeof object.timeUnixNano === "object")
                                        message.timeUnixNano = new $util.LongBits(object.timeUnixNano.low >>> 0, object.timeUnixNano.high >>> 0).toNumber(true);
                            if (object.name != null)
                                if (typeof object.name !== "string" || object.name.length)
                                    message.name = $String(object.name);
                            if (object.attributes) {
                                if (!$Array.isArray(object.attributes))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.Span.Event.attributes: array expected");
                                message.attributes = $Array(object.attributes.length);
                                for (let i = 0; i < object.attributes.length; ++i) {
                                    if (!$util.isObject(object.attributes[i]))
                                        throw $TypeError(".opentelemetry.proto.trace.v1.Span.Event.attributes: object expected");
                                    message.attributes[i] = $root.opentelemetry.proto.common.v1.KeyValue.fromObject(object.attributes[i], _depth + 1);
                                }
                            }
                            if (object.droppedAttributesCount != null)
                                if ($Number(object.droppedAttributesCount) !== 0)
                                    message.droppedAttributesCount = object.droppedAttributesCount >>> 0;
                            return message;
                        };

                        /**
                         * Creates a plain object from an Event message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Event} message Event
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        Event.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.arrays || options.defaults)
                                object.attributes = [];
                            if (options.defaults) {
                                if ($util.Long) {
                                    let long = new $util.Long(0, 0, true);
                                    object.timeUnixNano = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                                } else
                                    object.timeUnixNano = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                                object.name = "";
                                object.droppedAttributesCount = 0;
                            }
                            if (message.timeUnixNano != null && $Object.hasOwnProperty.call(message, "timeUnixNano"))
                                if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                    object.timeUnixNano = typeof message.timeUnixNano === "number" ? $BigInt(message.timeUnixNano) : $util.Long.fromBits(message.timeUnixNano.low >>> 0, message.timeUnixNano.high >>> 0, true).toBigInt();
                                else if (typeof message.timeUnixNano === "number")
                                    object.timeUnixNano = options.longs === $String ? $String(message.timeUnixNano) : message.timeUnixNano;
                                else
                                    object.timeUnixNano = options.longs === $String ? $util.Long.prototype.toString.call(message.timeUnixNano) : options.longs === $Number ? new $util.LongBits(message.timeUnixNano.low >>> 0, message.timeUnixNano.high >>> 0).toNumber(true) : message.timeUnixNano;
                            if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                                object.name = message.name;
                            if (message.attributes && message.attributes.length) {
                                object.attributes = $Array(message.attributes.length);
                                for (let j = 0; j < message.attributes.length; ++j)
                                    object.attributes[j] = $root.opentelemetry.proto.common.v1.KeyValue.toObject(message.attributes[j], options, _depth + 1);
                            }
                            if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                                object.droppedAttributesCount = message.droppedAttributesCount;
                            return object;
                        };

                        /**
                         * Converts this Event to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        Event.prototype.toJSON = function() {
                            return Event.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for Event
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.trace.v1.Span.Event
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        Event.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.trace.v1.Span.Event";
                        };

                        return Event;
                    })();

                    Span.Link = (function() {

                        /**
                         * Properties of a Link.
                         * @typedef {Object} opentelemetry.proto.trace.v1.Span.Link.$Properties
                         * @property {Uint8Array|null} [traceId] Link traceId
                         * @property {Uint8Array|null} [spanId] Link spanId
                         * @property {string|null} [traceState] Link traceState
                         * @property {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>|null} [attributes] Link attributes
                         * @property {number|null} [droppedAttributesCount] Link droppedAttributesCount
                         * @property {number|null} [flags] Link flags
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */

                        /**
                         * Properties of a Link.
                         * @memberof opentelemetry.proto.trace.v1.Span
                         * @interface ILink
                         * @augments opentelemetry.proto.trace.v1.Span.Link.$Properties
                         * @deprecated Use opentelemetry.proto.trace.v1.Span.Link.$Properties instead.
                         */

                        /**
                         * Shape of a Link.
                         * @typedef {{
                         *   traceId?: Uint8Array|null;
                         *   spanId?: Uint8Array|null;
                         *   traceState?: string|null;
                         *   attributes?: Array.<opentelemetry.proto.common.v1.KeyValue.$Shape>|null;
                         *   droppedAttributesCount?: number|null;
                         *   flags?: number|null;
                         *   $unknowns?: Array.<Uint8Array>;
                         * }} opentelemetry.proto.trace.v1.Span.Link.$Shape
                         */

                        /**
                         * Constructs a new Link.
                         * @memberof opentelemetry.proto.trace.v1.Span
                         * @classdesc Represents a Link.
                         * @constructor
                         * @param {opentelemetry.proto.trace.v1.Span.Link.$Properties=} [properties] Properties to set
                         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                         */
                        const Link = function (properties) {
                            this.attributes = [];
                            if (properties)
                                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                        this[keys[i]] = properties[keys[i]];
                        };

                        /**
                         * Link traceId.
                         * @member {Uint8Array} traceId
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @instance
                         */
                        Link.prototype.traceId = $util.newBuffer([]);

                        /**
                         * Link spanId.
                         * @member {Uint8Array} spanId
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @instance
                         */
                        Link.prototype.spanId = $util.newBuffer([]);

                        /**
                         * Link traceState.
                         * @member {string} traceState
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @instance
                         */
                        Link.prototype.traceState = "";

                        /**
                         * Link attributes.
                         * @member {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>} attributes
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @instance
                         */
                        Link.prototype.attributes = $util.emptyArray;

                        /**
                         * Link droppedAttributesCount.
                         * @member {number} droppedAttributesCount
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @instance
                         */
                        Link.prototype.droppedAttributesCount = 0;

                        /**
                         * Link flags.
                         * @member {number} flags
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @instance
                         */
                        Link.prototype.flags = 0;

                        /**
                         * Creates a new Link instance using the specified properties.
                         * @function create
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Link.$Properties=} [properties] Properties to set
                         * @returns {opentelemetry.proto.trace.v1.Span.Link} Link instance
                         * @type {{
                         *   (properties: opentelemetry.proto.trace.v1.Span.Link.$Shape): opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape;
                         *   (properties?: opentelemetry.proto.trace.v1.Span.Link.$Properties): opentelemetry.proto.trace.v1.Span.Link;
                         * }}
                         */
                        Link.create = function(properties) {
                            return new Link(properties);
                        };

                        /**
                         * Encodes the specified Link message. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Link.verify|verify} messages.
                         * @function encode
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Link.$Properties} message Link message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        Link.encode = function (message, writer, _depth) {
                            if (!writer)
                                writer = $Writer.create();
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId") && message.traceId.length)
                                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.traceId);
                            if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId") && message.spanId.length)
                                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.spanId);
                            if (message.traceState != null && $Object.hasOwnProperty.call(message, "traceState") && message.traceState !== "")
                                writer.uint32(/* id 3, wireType 2 =*/26).string(message.traceState);
                            if (message.attributes != null && message.attributes.length)
                                for (let i = 0; i < message.attributes.length; ++i)
                                    $root.opentelemetry.proto.common.v1.KeyValue.encode(message.attributes[i], writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                            if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount") && message.droppedAttributesCount !== 0)
                                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.droppedAttributesCount);
                            if (message.flags != null && $Object.hasOwnProperty.call(message, "flags") && message.flags !== 0)
                                writer.uint32(/* id 6, wireType 5 =*/53).fixed32(message.flags);
                            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                                for (let i = 0; i < message.$unknowns.length; ++i)
                                    writer.raw(message.$unknowns[i]);
                            return writer;
                        };

                        /**
                         * Encodes the specified Link message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Link.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Link.$Properties} message Link message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        Link.encodeDelimited = function(message, writer) {
                            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                        };

                        /**
                         * Decodes a Link message from the specified reader or buffer.
                         * @function decode
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape} Link
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        Link.decode = function (reader, length, _end, _depth, _target) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $Reader.recursionLimit)
                                throw $Error("max depth exceeded");
                            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.trace.v1.Span.Link(), value;
                            while (reader.pos < end) {
                                let start = reader.pos;
                                let tag = reader.tag();
                                if (tag === _end) {
                                    _end = $undefined;
                                    break;
                                }
                                let wireType = tag & 7;
                                switch (tag >>>= 3) {
                                case 1: {
                                        if (wireType !== 2)
                                            break;
                                        if ((value = reader.bytes()).length)
                                            message.traceId = value;
                                        else
                                            delete message.traceId;
                                        continue;
                                    }
                                case 2: {
                                        if (wireType !== 2)
                                            break;
                                        if ((value = reader.bytes()).length)
                                            message.spanId = value;
                                        else
                                            delete message.spanId;
                                        continue;
                                    }
                                case 3: {
                                        if (wireType !== 2)
                                            break;
                                        if ((value = reader.stringVerify()).length)
                                            message.traceState = value;
                                        else
                                            delete message.traceState;
                                        continue;
                                    }
                                case 4: {
                                        if (wireType !== 2)
                                            break;
                                        if (!(message.attributes && message.attributes.length))
                                            message.attributes = [];
                                        message.attributes.push($root.opentelemetry.proto.common.v1.KeyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                        continue;
                                    }
                                case 5: {
                                        if (wireType !== 0)
                                            break;
                                        if (value = reader.uint32())
                                            message.droppedAttributesCount = value;
                                        else
                                            delete message.droppedAttributesCount;
                                        continue;
                                    }
                                case 6: {
                                        if (wireType !== 5)
                                            break;
                                        if (value = reader.fixed32())
                                            message.flags = value;
                                        else
                                            delete message.flags;
                                        continue;
                                    }
                                }
                                reader.skipType(wireType, _depth, tag);
                                if (!reader.discardUnknown) {
                                    $util.makeProp(message, "$unknowns", false);
                                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                                }
                            }
                            if (_end !== $undefined)
                                throw $Error("missing end group");
                            return message;
                        };

                        /**
                         * Decodes a Link message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape} Link
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        Link.decodeDelimited = function(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies a Link message.
                         * @function verify
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        Link.verify = function (message, _depth) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                return "max depth exceeded";
                            if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId"))
                                if (!(message.traceId && typeof message.traceId.length === "number" || $util.isString(message.traceId)))
                                    return "traceId: buffer expected";
                            if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId"))
                                if (!(message.spanId && typeof message.spanId.length === "number" || $util.isString(message.spanId)))
                                    return "spanId: buffer expected";
                            if (message.traceState != null && $Object.hasOwnProperty.call(message, "traceState"))
                                if (!$util.isString(message.traceState))
                                    return "traceState: string expected";
                            if (message.attributes != null && $Object.hasOwnProperty.call(message, "attributes")) {
                                if (!$Array.isArray(message.attributes))
                                    return "attributes: array expected";
                                for (let i = 0; i < message.attributes.length; ++i) {
                                    let error = $root.opentelemetry.proto.common.v1.KeyValue.verify(message.attributes[i], _depth + 1);
                                    if (error)
                                        return "attributes." + error;
                                }
                            }
                            if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                                if (!$util.isInteger(message.droppedAttributesCount))
                                    return "droppedAttributesCount: integer expected";
                            if (message.flags != null && $Object.hasOwnProperty.call(message, "flags"))
                                if (!$util.isInteger(message.flags))
                                    return "flags: integer expected";
                            return null;
                        };

                        /**
                         * Creates a Link message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {opentelemetry.proto.trace.v1.Span.Link} Link
                         */
                        Link.fromObject = function (object, _depth) {
                            if (object instanceof $root.opentelemetry.proto.trace.v1.Span.Link)
                                return object;
                            if (!$util.isObject(object))
                                throw $TypeError(".opentelemetry.proto.trace.v1.Span.Link: object expected");
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let message = new $root.opentelemetry.proto.trace.v1.Span.Link();
                            if (object.traceId != null)
                                if (object.traceId.length)
                                    if (typeof object.traceId === "string")
                                        $util.base64.decode(object.traceId, message.traceId = $util.newBuffer($util.base64.length(object.traceId)), 0);
                                    else if (object.traceId.length >= 0)
                                        message.traceId = object.traceId;
                            if (object.spanId != null)
                                if (object.spanId.length)
                                    if (typeof object.spanId === "string")
                                        $util.base64.decode(object.spanId, message.spanId = $util.newBuffer($util.base64.length(object.spanId)), 0);
                                    else if (object.spanId.length >= 0)
                                        message.spanId = object.spanId;
                            if (object.traceState != null)
                                if (typeof object.traceState !== "string" || object.traceState.length)
                                    message.traceState = $String(object.traceState);
                            if (object.attributes) {
                                if (!$Array.isArray(object.attributes))
                                    throw $TypeError(".opentelemetry.proto.trace.v1.Span.Link.attributes: array expected");
                                message.attributes = $Array(object.attributes.length);
                                for (let i = 0; i < object.attributes.length; ++i) {
                                    if (!$util.isObject(object.attributes[i]))
                                        throw $TypeError(".opentelemetry.proto.trace.v1.Span.Link.attributes: object expected");
                                    message.attributes[i] = $root.opentelemetry.proto.common.v1.KeyValue.fromObject(object.attributes[i], _depth + 1);
                                }
                            }
                            if (object.droppedAttributesCount != null)
                                if ($Number(object.droppedAttributesCount) !== 0)
                                    message.droppedAttributesCount = object.droppedAttributesCount >>> 0;
                            if (object.flags != null)
                                if ($Number(object.flags) !== 0)
                                    message.flags = object.flags >>> 0;
                            return message;
                        };

                        /**
                         * Creates a plain object from a Link message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {opentelemetry.proto.trace.v1.Span.Link} message Link
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        Link.toObject = function (message, options, _depth) {
                            if (!options)
                                options = {};
                            if (_depth === $undefined)
                                _depth = 0;
                            if (_depth > $util.recursionLimit)
                                throw $Error("max depth exceeded");
                            let object = {};
                            if (options.arrays || options.defaults)
                                object.attributes = [];
                            if (options.defaults) {
                                if (options.bytes === $String)
                                    object.traceId = "";
                                else {
                                    object.traceId = [];
                                    if (options.bytes !== $Array)
                                        object.traceId = $util.newBuffer(object.traceId);
                                }
                                if (options.bytes === $String)
                                    object.spanId = "";
                                else {
                                    object.spanId = [];
                                    if (options.bytes !== $Array)
                                        object.spanId = $util.newBuffer(object.spanId);
                                }
                                object.traceState = "";
                                object.droppedAttributesCount = 0;
                                object.flags = 0;
                            }
                            if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId"))
                                object.traceId = options.bytes === $String ? $util.base64.encode(message.traceId, 0, message.traceId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.traceId) : message.traceId;
                            if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId"))
                                object.spanId = options.bytes === $String ? $util.base64.encode(message.spanId, 0, message.spanId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.spanId) : message.spanId;
                            if (message.traceState != null && $Object.hasOwnProperty.call(message, "traceState"))
                                object.traceState = message.traceState;
                            if (message.attributes && message.attributes.length) {
                                object.attributes = $Array(message.attributes.length);
                                for (let j = 0; j < message.attributes.length; ++j)
                                    object.attributes[j] = $root.opentelemetry.proto.common.v1.KeyValue.toObject(message.attributes[j], options, _depth + 1);
                            }
                            if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                                object.droppedAttributesCount = message.droppedAttributesCount;
                            if (message.flags != null && $Object.hasOwnProperty.call(message, "flags"))
                                object.flags = message.flags;
                            return object;
                        };

                        /**
                         * Converts this Link to JSON.
                         * @function toJSON
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        Link.prototype.toJSON = function() {
                            return Link.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the type url for Link
                         * @function getTypeUrl
                         * @memberof opentelemetry.proto.trace.v1.Span.Link
                         * @static
                         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns {string} The type url
                         */
                        Link.getTypeUrl = function(prefix) {
                            if (prefix === $undefined)
                                prefix = "type.googleapis.com";
                            return prefix + "/opentelemetry.proto.trace.v1.Span.Link";
                        };

                        return Link;
                    })();

                    return Span;
                })();

                v1.Status = (function() {

                    /**
                     * Properties of a Status.
                     * @typedef {Object} opentelemetry.proto.trace.v1.Status.$Properties
                     * @property {string|null} [message] Status message
                     * @property {opentelemetry.proto.trace.v1.Status.StatusCode|null} [code] Status code
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a Status.
                     * @memberof opentelemetry.proto.trace.v1
                     * @interface IStatus
                     * @augments opentelemetry.proto.trace.v1.Status.$Properties
                     * @deprecated Use opentelemetry.proto.trace.v1.Status.$Properties instead.
                     */

                    /**
                     * Shape of a Status.
                     * @typedef {opentelemetry.proto.trace.v1.Status.$Properties} opentelemetry.proto.trace.v1.Status.$Shape
                     */

                    /**
                     * Constructs a new Status.
                     * @memberof opentelemetry.proto.trace.v1
                     * @classdesc Represents a Status.
                     * @constructor
                     * @param {opentelemetry.proto.trace.v1.Status.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const Status = function (properties) {
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * Status message.
                     * @member {string} message
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @instance
                     */
                    Status.prototype.message = "";

                    /**
                     * Status code.
                     * @member {opentelemetry.proto.trace.v1.Status.StatusCode} code
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @instance
                     */
                    Status.prototype.code = 0;

                    /**
                     * Creates a new Status instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Status.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.trace.v1.Status} Status instance
                     * @type {{
                     *   (properties: opentelemetry.proto.trace.v1.Status.$Shape): opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape;
                     *   (properties?: opentelemetry.proto.trace.v1.Status.$Properties): opentelemetry.proto.trace.v1.Status;
                     * }}
                     */
                    Status.create = function(properties) {
                        return new Status(properties);
                    };

                    /**
                     * Encodes the specified Status message. Does not implicitly {@link opentelemetry.proto.trace.v1.Status.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Status.$Properties} message Status message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Status.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.message != null && $Object.hasOwnProperty.call(message, "message") && message.message !== "")
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                        if (message.code != null && $Object.hasOwnProperty.call(message, "code") && message.code !== 0)
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.code);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified Status message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Status.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Status.$Properties} message Status message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Status.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a Status message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape} Status
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Status.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.trace.v1.Status(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.message = value;
                                    else
                                        delete message.message;
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.int32())
                                        message.code = value;
                                    else
                                        delete message.code;
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a Status message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape} Status
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Status.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Status message.
                     * @function verify
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Status.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                            if (!$util.isString(message.message))
                                return "message: string expected";
                        if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
                            if (typeof message.code !== "number" || (message.code | 0) !== message.code)
                                return "code: enum value expected";
                        return null;
                    };

                    /**
                     * Creates a Status message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.trace.v1.Status} Status
                     */
                    Status.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.trace.v1.Status)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.trace.v1.Status: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.trace.v1.Status();
                        if (object.message != null)
                            if (typeof object.message !== "string" || object.message.length)
                                message.message = $String(object.message);
                        if (object.code !== 0 && (typeof object.code !== "string" || $root.opentelemetry.proto.trace.v1.Status.StatusCode[object.code] !== 0))
                            switch (object.code) {
                            case "STATUS_CODE_UNSET":
                            case 0:
                                message.code = 0;
                                break;
                            case "STATUS_CODE_OK":
                            case 1:
                                message.code = 1;
                                break;
                            case "STATUS_CODE_ERROR":
                            case 2:
                                message.code = 2;
                                break;
                            default:
                                if (typeof object.code === "number" && (object.code | 0) === object.code)
                                    message.code = object.code;
                            }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Status message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {opentelemetry.proto.trace.v1.Status} message Status
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Status.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.defaults) {
                            object.message = "";
                            object.code = options.enums === $String ? "STATUS_CODE_UNSET" : 0;
                        }
                        if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                            object.message = message.message;
                        if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
                            object.code = options.enums === $String ? $root.opentelemetry.proto.trace.v1.Status.StatusCode[message.code] === $undefined ? message.code : $root.opentelemetry.proto.trace.v1.Status.StatusCode[message.code] : message.code;
                        return object;
                    };

                    /**
                     * Converts this Status to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Status.prototype.toJSON = function() {
                        return Status.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for Status
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.trace.v1.Status
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    Status.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.trace.v1.Status";
                    };

                    /**
                     * StatusCode enum.
                     * @name opentelemetry.proto.trace.v1.Status.StatusCode
                     * @enum {number}
                     * @property {number} STATUS_CODE_UNSET=0 STATUS_CODE_UNSET value
                     * @property {number} STATUS_CODE_OK=1 STATUS_CODE_OK value
                     * @property {number} STATUS_CODE_ERROR=2 STATUS_CODE_ERROR value
                     */
                    Status.StatusCode = (function() {
                        const valuesById = $Object.create(null), values = $Object.create(valuesById);
                        values[valuesById[0] = "STATUS_CODE_UNSET"] = 0;
                        values[valuesById[1] = "STATUS_CODE_OK"] = 1;
                        values[valuesById[2] = "STATUS_CODE_ERROR"] = 2;
                        return values;
                    })();

                    return Status;
                })();

                /**
                 * SpanFlags enum.
                 * @name opentelemetry.proto.trace.v1.SpanFlags
                 * @enum {number}
                 * @property {number} SPAN_FLAGS_DO_NOT_USE=0 SPAN_FLAGS_DO_NOT_USE value
                 * @property {number} SPAN_FLAGS_TRACE_FLAGS_MASK=255 SPAN_FLAGS_TRACE_FLAGS_MASK value
                 * @property {number} SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK=256 SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK value
                 * @property {number} SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK=512 SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK value
                 */
                v1.SpanFlags = (function() {
                    const valuesById = $Object.create(null), values = $Object.create(valuesById);
                    values[valuesById[0] = "SPAN_FLAGS_DO_NOT_USE"] = 0;
                    values[valuesById[255] = "SPAN_FLAGS_TRACE_FLAGS_MASK"] = 255;
                    values[valuesById[256] = "SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK"] = 256;
                    values[valuesById[512] = "SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK"] = 512;
                    return values;
                })();

                return v1;
            })();

            return trace;
        })();

        proto.common = (function() {

            /**
             * Namespace common.
             * @memberof opentelemetry.proto
             * @namespace
             */
            const common = {};

            common.v1 = (function() {

                /**
                 * Namespace v1.
                 * @memberof opentelemetry.proto.common
                 * @namespace
                 */
                const v1 = {};

                v1.AnyValue = (function() {

                    /**
                     * Properties of an AnyValue.
                     * @typedef {Object} opentelemetry.proto.common.v1.AnyValue.$Properties
                     * @property {string|null} [stringValue] AnyValue stringValue
                     * @property {boolean|null} [boolValue] AnyValue boolValue
                     * @property {number|Long|null} [intValue] AnyValue intValue
                     * @property {number|null} [doubleValue] AnyValue doubleValue
                     * @property {opentelemetry.proto.common.v1.ArrayValue.$Properties|null} [arrayValue] AnyValue arrayValue
                     * @property {opentelemetry.proto.common.v1.KeyValueList.$Properties|null} [kvlistValue] AnyValue kvlistValue
                     * @property {Uint8Array|null} [bytesValue] AnyValue bytesValue
                     * @property {"stringValue"|"boolValue"|"intValue"|"doubleValue"|"arrayValue"|"kvlistValue"|"bytesValue"} [value] AnyValue value
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of an AnyValue.
                     * @memberof opentelemetry.proto.common.v1
                     * @interface IAnyValue
                     * @augments opentelemetry.proto.common.v1.AnyValue.$Properties
                     * @deprecated Use opentelemetry.proto.common.v1.AnyValue.$Properties instead.
                     */

                    /**
                     * Narrowed shape of an AnyValue.
                     * @typedef {{
                     *   stringValue?: string|null;
                     *   boolValue?: boolean|null;
                     *   intValue?: number|Long|null;
                     *   doubleValue?: number|null;
                     *   arrayValue?: opentelemetry.proto.common.v1.ArrayValue.$Shape|null;
                     *   kvlistValue?: opentelemetry.proto.common.v1.KeyValueList.$Shape|null;
                     *   bytesValue?: Uint8Array|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * } & (
                     *   ({ value?: undefined; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "stringValue"; stringValue: string; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "boolValue"; stringValue?: null; boolValue: boolean; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "intValue"; stringValue?: null; boolValue?: null; intValue: number|Long; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "doubleValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue: number; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "arrayValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue: opentelemetry.proto.common.v1.ArrayValue.$Shape; kvlistValue?: null; bytesValue?: null }|{ value?: "kvlistValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue: opentelemetry.proto.common.v1.KeyValueList.$Shape; bytesValue?: null }|{ value?: "bytesValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue: Uint8Array })
                     * )} opentelemetry.proto.common.v1.AnyValue.$Shape
                     */

                    /**
                     * Constructs a new AnyValue.
                     * @memberof opentelemetry.proto.common.v1
                     * @classdesc Represents an AnyValue.
                     * @constructor
                     * @param {opentelemetry.proto.common.v1.AnyValue.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const AnyValue = function (properties) {
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * AnyValue stringValue.
                     * @member {string|null|undefined} stringValue
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    AnyValue.prototype.stringValue = null;

                    /**
                     * AnyValue boolValue.
                     * @member {boolean|null|undefined} boolValue
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    AnyValue.prototype.boolValue = null;

                    /**
                     * AnyValue intValue.
                     * @member {number|Long|null|undefined} intValue
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    AnyValue.prototype.intValue = null;

                    /**
                     * AnyValue doubleValue.
                     * @member {number|null|undefined} doubleValue
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    AnyValue.prototype.doubleValue = null;

                    /**
                     * AnyValue arrayValue.
                     * @member {opentelemetry.proto.common.v1.ArrayValue.$Properties|null|undefined} arrayValue
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    AnyValue.prototype.arrayValue = null;

                    /**
                     * AnyValue kvlistValue.
                     * @member {opentelemetry.proto.common.v1.KeyValueList.$Properties|null|undefined} kvlistValue
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    AnyValue.prototype.kvlistValue = null;

                    /**
                     * AnyValue bytesValue.
                     * @member {Uint8Array|null|undefined} bytesValue
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    AnyValue.prototype.bytesValue = null;

                    // OneOf field names bound to virtual getters and setters
                    let $oneOfFields;

                    /**
                     * AnyValue value.
                     * @member {"stringValue"|"boolValue"|"intValue"|"doubleValue"|"arrayValue"|"kvlistValue"|"bytesValue"|undefined} value
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     */
                    $Object.defineProperty(AnyValue.prototype, "value", {
                        get: $util.oneOfGetter($oneOfFields = ["stringValue", "boolValue", "intValue", "doubleValue", "arrayValue", "kvlistValue", "bytesValue"]),
                        set: $util.oneOfSetter($oneOfFields)
                    });

                    /**
                     * Creates a new AnyValue instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.AnyValue.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.common.v1.AnyValue} AnyValue instance
                     * @type {{
                     *   (properties: opentelemetry.proto.common.v1.AnyValue.$Shape): opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape;
                     *   (properties?: opentelemetry.proto.common.v1.AnyValue.$Properties): opentelemetry.proto.common.v1.AnyValue;
                     * }}
                     */
                    AnyValue.create = function(properties) {
                        return new AnyValue(properties);
                    };

                    /**
                     * Encodes the specified AnyValue message. Does not implicitly {@link opentelemetry.proto.common.v1.AnyValue.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.AnyValue.$Properties} message AnyValue message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    AnyValue.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.stringValue != null && $Object.hasOwnProperty.call(message, "stringValue"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.stringValue);
                        if (message.boolValue != null && $Object.hasOwnProperty.call(message, "boolValue"))
                            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.boolValue);
                        if (message.intValue != null && $Object.hasOwnProperty.call(message, "intValue"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.intValue);
                        if (message.doubleValue != null && $Object.hasOwnProperty.call(message, "doubleValue"))
                            writer.uint32(/* id 4, wireType 1 =*/33).double(message.doubleValue);
                        if (message.arrayValue != null && $Object.hasOwnProperty.call(message, "arrayValue"))
                            $root.opentelemetry.proto.common.v1.ArrayValue.encode(message.arrayValue, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                        if (message.kvlistValue != null && $Object.hasOwnProperty.call(message, "kvlistValue"))
                            $root.opentelemetry.proto.common.v1.KeyValueList.encode(message.kvlistValue, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                        if (message.bytesValue != null && $Object.hasOwnProperty.call(message, "bytesValue"))
                            writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.bytesValue);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified AnyValue message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.AnyValue.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.AnyValue.$Properties} message AnyValue message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    AnyValue.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes an AnyValue message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape} AnyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    AnyValue.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.common.v1.AnyValue();
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    message.stringValue = reader.stringVerify();
                                    message.value = "stringValue";
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 0)
                                        break;
                                    message.boolValue = reader.bool();
                                    message.value = "boolValue";
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 0)
                                        break;
                                    message.intValue = reader.int64();
                                    message.value = "intValue";
                                    continue;
                                }
                            case 4: {
                                    if (wireType !== 1)
                                        break;
                                    message.doubleValue = reader.double();
                                    message.value = "doubleValue";
                                    continue;
                                }
                            case 5: {
                                    if (wireType !== 2)
                                        break;
                                    message.arrayValue = $root.opentelemetry.proto.common.v1.ArrayValue.decode(reader, reader.uint32(), $undefined, _depth + 1, message.arrayValue);
                                    message.value = "arrayValue";
                                    continue;
                                }
                            case 6: {
                                    if (wireType !== 2)
                                        break;
                                    message.kvlistValue = $root.opentelemetry.proto.common.v1.KeyValueList.decode(reader, reader.uint32(), $undefined, _depth + 1, message.kvlistValue);
                                    message.value = "kvlistValue";
                                    continue;
                                }
                            case 7: {
                                    if (wireType !== 2)
                                        break;
                                    message.bytesValue = reader.bytes();
                                    message.value = "bytesValue";
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes an AnyValue message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape} AnyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    AnyValue.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an AnyValue message.
                     * @function verify
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    AnyValue.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        let properties = {};
                        if (message.stringValue != null && $Object.hasOwnProperty.call(message, "stringValue")) {
                            properties.value = 1;
                            if (!$util.isString(message.stringValue))
                                return "stringValue: string expected";
                        }
                        if (message.boolValue != null && $Object.hasOwnProperty.call(message, "boolValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            if (typeof message.boolValue !== "boolean")
                                return "boolValue: boolean expected";
                        }
                        if (message.intValue != null && $Object.hasOwnProperty.call(message, "intValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            if (!$util.isInteger(message.intValue) && !(message.intValue && $util.isInteger(message.intValue.low) && $util.isInteger(message.intValue.high)))
                                return "intValue: integer|Long expected";
                        }
                        if (message.doubleValue != null && $Object.hasOwnProperty.call(message, "doubleValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            if (typeof message.doubleValue !== "number")
                                return "doubleValue: number expected";
                        }
                        if (message.arrayValue != null && $Object.hasOwnProperty.call(message, "arrayValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            {
                                let error = $root.opentelemetry.proto.common.v1.ArrayValue.verify(message.arrayValue, _depth + 1);
                                if (error)
                                    return "arrayValue." + error;
                            }
                        }
                        if (message.kvlistValue != null && $Object.hasOwnProperty.call(message, "kvlistValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            {
                                let error = $root.opentelemetry.proto.common.v1.KeyValueList.verify(message.kvlistValue, _depth + 1);
                                if (error)
                                    return "kvlistValue." + error;
                            }
                        }
                        if (message.bytesValue != null && $Object.hasOwnProperty.call(message, "bytesValue")) {
                            if (properties.value === 1)
                                return "value: multiple values";
                            properties.value = 1;
                            if (!(message.bytesValue && typeof message.bytesValue.length === "number" || $util.isString(message.bytesValue)))
                                return "bytesValue: buffer expected";
                        }
                        return null;
                    };

                    /**
                     * Creates an AnyValue message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.common.v1.AnyValue} AnyValue
                     */
                    AnyValue.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.common.v1.AnyValue)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.common.v1.AnyValue: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.common.v1.AnyValue();
                        if (object.stringValue != null)
                            message.stringValue = $String(object.stringValue);
                        if (object.boolValue != null)
                            message.boolValue = $Boolean(object.boolValue);
                        if (object.intValue != null)
                            if ($util.Long)
                                message.intValue = $util.Long.fromValue(object.intValue, false);
                            else if (typeof object.intValue === "string")
                                message.intValue = $parseInt(object.intValue, 10);
                            else if (typeof object.intValue === "number")
                                message.intValue = object.intValue;
                            else if (typeof object.intValue === "object")
                                message.intValue = new $util.LongBits(object.intValue.low >>> 0, object.intValue.high >>> 0).toNumber();
                        if (object.doubleValue != null)
                            message.doubleValue = $Number(object.doubleValue);
                        if (object.arrayValue != null) {
                            if (!$util.isObject(object.arrayValue))
                                throw $TypeError(".opentelemetry.proto.common.v1.AnyValue.arrayValue: object expected");
                            message.arrayValue = $root.opentelemetry.proto.common.v1.ArrayValue.fromObject(object.arrayValue, _depth + 1);
                        }
                        if (object.kvlistValue != null) {
                            if (!$util.isObject(object.kvlistValue))
                                throw $TypeError(".opentelemetry.proto.common.v1.AnyValue.kvlistValue: object expected");
                            message.kvlistValue = $root.opentelemetry.proto.common.v1.KeyValueList.fromObject(object.kvlistValue, _depth + 1);
                        }
                        if (object.bytesValue != null)
                            if (typeof object.bytesValue === "string")
                                $util.base64.decode(object.bytesValue, message.bytesValue = $util.newBuffer($util.base64.length(object.bytesValue)), 0);
                            else if (object.bytesValue.length >= 0)
                                message.bytesValue = object.bytesValue;
                        return message;
                    };

                    /**
                     * Creates a plain object from an AnyValue message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.AnyValue} message AnyValue
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    AnyValue.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (message.stringValue != null && $Object.hasOwnProperty.call(message, "stringValue")) {
                            object.stringValue = message.stringValue;
                            if (options.oneofs)
                                object.value = "stringValue";
                        }
                        if (message.boolValue != null && $Object.hasOwnProperty.call(message, "boolValue")) {
                            object.boolValue = message.boolValue;
                            if (options.oneofs)
                                object.value = "boolValue";
                        }
                        if (message.intValue != null && $Object.hasOwnProperty.call(message, "intValue")) {
                            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                object.intValue = typeof message.intValue === "number" ? $BigInt(message.intValue) : $util.Long.fromBits(message.intValue.low >>> 0, message.intValue.high >>> 0, false).toBigInt();
                            else if (typeof message.intValue === "number")
                                object.intValue = options.longs === $String ? $String(message.intValue) : message.intValue;
                            else
                                object.intValue = options.longs === $String ? $util.Long.prototype.toString.call(message.intValue) : options.longs === $Number ? new $util.LongBits(message.intValue.low >>> 0, message.intValue.high >>> 0).toNumber() : message.intValue;
                            if (options.oneofs)
                                object.value = "intValue";
                        }
                        if (message.doubleValue != null && $Object.hasOwnProperty.call(message, "doubleValue")) {
                            object.doubleValue = options.json && !$isFinite(message.doubleValue) ? $String(message.doubleValue) : message.doubleValue;
                            if (options.oneofs)
                                object.value = "doubleValue";
                        }
                        if (message.arrayValue != null && $Object.hasOwnProperty.call(message, "arrayValue")) {
                            object.arrayValue = $root.opentelemetry.proto.common.v1.ArrayValue.toObject(message.arrayValue, options, _depth + 1);
                            if (options.oneofs)
                                object.value = "arrayValue";
                        }
                        if (message.kvlistValue != null && $Object.hasOwnProperty.call(message, "kvlistValue")) {
                            object.kvlistValue = $root.opentelemetry.proto.common.v1.KeyValueList.toObject(message.kvlistValue, options, _depth + 1);
                            if (options.oneofs)
                                object.value = "kvlistValue";
                        }
                        if (message.bytesValue != null && $Object.hasOwnProperty.call(message, "bytesValue")) {
                            object.bytesValue = options.bytes === $String ? $util.base64.encode(message.bytesValue, 0, message.bytesValue.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.bytesValue) : message.bytesValue;
                            if (options.oneofs)
                                object.value = "bytesValue";
                        }
                        return object;
                    };

                    /**
                     * Converts this AnyValue to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    AnyValue.prototype.toJSON = function() {
                        return AnyValue.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for AnyValue
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.common.v1.AnyValue
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    AnyValue.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.common.v1.AnyValue";
                    };

                    return AnyValue;
                })();

                v1.ArrayValue = (function() {

                    /**
                     * Properties of an ArrayValue.
                     * @typedef {Object} opentelemetry.proto.common.v1.ArrayValue.$Properties
                     * @property {Array.<opentelemetry.proto.common.v1.AnyValue.$Properties>|null} [values] ArrayValue values
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of an ArrayValue.
                     * @memberof opentelemetry.proto.common.v1
                     * @interface IArrayValue
                     * @augments opentelemetry.proto.common.v1.ArrayValue.$Properties
                     * @deprecated Use opentelemetry.proto.common.v1.ArrayValue.$Properties instead.
                     */

                    /**
                     * Shape of an ArrayValue.
                     * @typedef {{
                     *   values?: Array.<opentelemetry.proto.common.v1.AnyValue.$Shape>|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.common.v1.ArrayValue.$Shape
                     */

                    /**
                     * Constructs a new ArrayValue.
                     * @memberof opentelemetry.proto.common.v1
                     * @classdesc Represents an ArrayValue.
                     * @constructor
                     * @param {opentelemetry.proto.common.v1.ArrayValue.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const ArrayValue = function (properties) {
                        this.values = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * ArrayValue values.
                     * @member {Array.<opentelemetry.proto.common.v1.AnyValue.$Properties>} values
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @instance
                     */
                    ArrayValue.prototype.values = $util.emptyArray;

                    /**
                     * Creates a new ArrayValue instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.ArrayValue.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.common.v1.ArrayValue} ArrayValue instance
                     * @type {{
                     *   (properties: opentelemetry.proto.common.v1.ArrayValue.$Shape): opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape;
                     *   (properties?: opentelemetry.proto.common.v1.ArrayValue.$Properties): opentelemetry.proto.common.v1.ArrayValue;
                     * }}
                     */
                    ArrayValue.create = function(properties) {
                        return new ArrayValue(properties);
                    };

                    /**
                     * Encodes the specified ArrayValue message. Does not implicitly {@link opentelemetry.proto.common.v1.ArrayValue.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.ArrayValue.$Properties} message ArrayValue message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ArrayValue.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.values != null && message.values.length)
                            for (let i = 0; i < message.values.length; ++i)
                                $root.opentelemetry.proto.common.v1.AnyValue.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified ArrayValue message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.ArrayValue.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.ArrayValue.$Properties} message ArrayValue message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ArrayValue.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes an ArrayValue message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape} ArrayValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ArrayValue.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.common.v1.ArrayValue();
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.values && message.values.length))
                                        message.values = [];
                                    message.values.push($root.opentelemetry.proto.common.v1.AnyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes an ArrayValue message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape} ArrayValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ArrayValue.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an ArrayValue message.
                     * @function verify
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ArrayValue.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.values != null && $Object.hasOwnProperty.call(message, "values")) {
                            if (!$Array.isArray(message.values))
                                return "values: array expected";
                            for (let i = 0; i < message.values.length; ++i) {
                                let error = $root.opentelemetry.proto.common.v1.AnyValue.verify(message.values[i], _depth + 1);
                                if (error)
                                    return "values." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates an ArrayValue message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.common.v1.ArrayValue} ArrayValue
                     */
                    ArrayValue.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.common.v1.ArrayValue)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.common.v1.ArrayValue: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.common.v1.ArrayValue();
                        if (object.values) {
                            if (!$Array.isArray(object.values))
                                throw $TypeError(".opentelemetry.proto.common.v1.ArrayValue.values: array expected");
                            message.values = $Array(object.values.length);
                            for (let i = 0; i < object.values.length; ++i) {
                                if (!$util.isObject(object.values[i]))
                                    throw $TypeError(".opentelemetry.proto.common.v1.ArrayValue.values: object expected");
                                message.values[i] = $root.opentelemetry.proto.common.v1.AnyValue.fromObject(object.values[i], _depth + 1);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from an ArrayValue message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.ArrayValue} message ArrayValue
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ArrayValue.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.values = [];
                        if (message.values && message.values.length) {
                            object.values = $Array(message.values.length);
                            for (let j = 0; j < message.values.length; ++j)
                                object.values[j] = $root.opentelemetry.proto.common.v1.AnyValue.toObject(message.values[j], options, _depth + 1);
                        }
                        return object;
                    };

                    /**
                     * Converts this ArrayValue to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ArrayValue.prototype.toJSON = function() {
                        return ArrayValue.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for ArrayValue
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.common.v1.ArrayValue
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    ArrayValue.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.common.v1.ArrayValue";
                    };

                    return ArrayValue;
                })();

                v1.KeyValueList = (function() {

                    /**
                     * Properties of a KeyValueList.
                     * @typedef {Object} opentelemetry.proto.common.v1.KeyValueList.$Properties
                     * @property {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>|null} [values] KeyValueList values
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a KeyValueList.
                     * @memberof opentelemetry.proto.common.v1
                     * @interface IKeyValueList
                     * @augments opentelemetry.proto.common.v1.KeyValueList.$Properties
                     * @deprecated Use opentelemetry.proto.common.v1.KeyValueList.$Properties instead.
                     */

                    /**
                     * Shape of a KeyValueList.
                     * @typedef {{
                     *   values?: Array.<opentelemetry.proto.common.v1.KeyValue.$Shape>|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.common.v1.KeyValueList.$Shape
                     */

                    /**
                     * Constructs a new KeyValueList.
                     * @memberof opentelemetry.proto.common.v1
                     * @classdesc Represents a KeyValueList.
                     * @constructor
                     * @param {opentelemetry.proto.common.v1.KeyValueList.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const KeyValueList = function (properties) {
                        this.values = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * KeyValueList values.
                     * @member {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>} values
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @instance
                     */
                    KeyValueList.prototype.values = $util.emptyArray;

                    /**
                     * Creates a new KeyValueList instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValueList.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.common.v1.KeyValueList} KeyValueList instance
                     * @type {{
                     *   (properties: opentelemetry.proto.common.v1.KeyValueList.$Shape): opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape;
                     *   (properties?: opentelemetry.proto.common.v1.KeyValueList.$Properties): opentelemetry.proto.common.v1.KeyValueList;
                     * }}
                     */
                    KeyValueList.create = function(properties) {
                        return new KeyValueList(properties);
                    };

                    /**
                     * Encodes the specified KeyValueList message. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValueList.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValueList.$Properties} message KeyValueList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    KeyValueList.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.values != null && message.values.length)
                            for (let i = 0; i < message.values.length; ++i)
                                $root.opentelemetry.proto.common.v1.KeyValue.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified KeyValueList message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValueList.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValueList.$Properties} message KeyValueList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    KeyValueList.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a KeyValueList message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape} KeyValueList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    KeyValueList.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.common.v1.KeyValueList();
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.values && message.values.length))
                                        message.values = [];
                                    message.values.push($root.opentelemetry.proto.common.v1.KeyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a KeyValueList message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape} KeyValueList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    KeyValueList.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a KeyValueList message.
                     * @function verify
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    KeyValueList.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.values != null && $Object.hasOwnProperty.call(message, "values")) {
                            if (!$Array.isArray(message.values))
                                return "values: array expected";
                            for (let i = 0; i < message.values.length; ++i) {
                                let error = $root.opentelemetry.proto.common.v1.KeyValue.verify(message.values[i], _depth + 1);
                                if (error)
                                    return "values." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a KeyValueList message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.common.v1.KeyValueList} KeyValueList
                     */
                    KeyValueList.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.common.v1.KeyValueList)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.common.v1.KeyValueList: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.common.v1.KeyValueList();
                        if (object.values) {
                            if (!$Array.isArray(object.values))
                                throw $TypeError(".opentelemetry.proto.common.v1.KeyValueList.values: array expected");
                            message.values = $Array(object.values.length);
                            for (let i = 0; i < object.values.length; ++i) {
                                if (!$util.isObject(object.values[i]))
                                    throw $TypeError(".opentelemetry.proto.common.v1.KeyValueList.values: object expected");
                                message.values[i] = $root.opentelemetry.proto.common.v1.KeyValue.fromObject(object.values[i], _depth + 1);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a KeyValueList message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValueList} message KeyValueList
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    KeyValueList.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.values = [];
                        if (message.values && message.values.length) {
                            object.values = $Array(message.values.length);
                            for (let j = 0; j < message.values.length; ++j)
                                object.values[j] = $root.opentelemetry.proto.common.v1.KeyValue.toObject(message.values[j], options, _depth + 1);
                        }
                        return object;
                    };

                    /**
                     * Converts this KeyValueList to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    KeyValueList.prototype.toJSON = function() {
                        return KeyValueList.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for KeyValueList
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.common.v1.KeyValueList
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    KeyValueList.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.common.v1.KeyValueList";
                    };

                    return KeyValueList;
                })();

                v1.KeyValue = (function() {

                    /**
                     * Properties of a KeyValue.
                     * @typedef {Object} opentelemetry.proto.common.v1.KeyValue.$Properties
                     * @property {string|null} [key] KeyValue key
                     * @property {opentelemetry.proto.common.v1.AnyValue.$Properties|null} [value] KeyValue value
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a KeyValue.
                     * @memberof opentelemetry.proto.common.v1
                     * @interface IKeyValue
                     * @augments opentelemetry.proto.common.v1.KeyValue.$Properties
                     * @deprecated Use opentelemetry.proto.common.v1.KeyValue.$Properties instead.
                     */

                    /**
                     * Shape of a KeyValue.
                     * @typedef {{
                     *   key?: string|null;
                     *   value?: opentelemetry.proto.common.v1.AnyValue.$Shape|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.common.v1.KeyValue.$Shape
                     */

                    /**
                     * Constructs a new KeyValue.
                     * @memberof opentelemetry.proto.common.v1
                     * @classdesc Represents a KeyValue.
                     * @constructor
                     * @param {opentelemetry.proto.common.v1.KeyValue.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const KeyValue = function (properties) {
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * KeyValue key.
                     * @member {string} key
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @instance
                     */
                    KeyValue.prototype.key = "";

                    /**
                     * KeyValue value.
                     * @member {opentelemetry.proto.common.v1.AnyValue.$Properties|null|undefined} value
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @instance
                     */
                    KeyValue.prototype.value = null;

                    /**
                     * Creates a new KeyValue instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValue.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.common.v1.KeyValue} KeyValue instance
                     * @type {{
                     *   (properties: opentelemetry.proto.common.v1.KeyValue.$Shape): opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape;
                     *   (properties?: opentelemetry.proto.common.v1.KeyValue.$Properties): opentelemetry.proto.common.v1.KeyValue;
                     * }}
                     */
                    KeyValue.create = function(properties) {
                        return new KeyValue(properties);
                    };

                    /**
                     * Encodes the specified KeyValue message. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValue.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValue.$Properties} message KeyValue message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    KeyValue.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.key != null && $Object.hasOwnProperty.call(message, "key") && message.key !== "")
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
                        if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                            $root.opentelemetry.proto.common.v1.AnyValue.encode(message.value, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified KeyValue message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValue.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValue.$Properties} message KeyValue message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    KeyValue.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a KeyValue message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape} KeyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    KeyValue.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.common.v1.KeyValue(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.key = value;
                                    else
                                        delete message.key;
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    message.value = $root.opentelemetry.proto.common.v1.AnyValue.decode(reader, reader.uint32(), $undefined, _depth + 1, message.value);
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a KeyValue message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape} KeyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    KeyValue.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a KeyValue message.
                     * @function verify
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    KeyValue.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                            if (!$util.isString(message.key))
                                return "key: string expected";
                        if (message.value != null && $Object.hasOwnProperty.call(message, "value")) {
                            let error = $root.opentelemetry.proto.common.v1.AnyValue.verify(message.value, _depth + 1);
                            if (error)
                                return "value." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a KeyValue message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.common.v1.KeyValue} KeyValue
                     */
                    KeyValue.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.common.v1.KeyValue)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.common.v1.KeyValue: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.common.v1.KeyValue();
                        if (object.key != null)
                            if (typeof object.key !== "string" || object.key.length)
                                message.key = $String(object.key);
                        if (object.value != null) {
                            if (!$util.isObject(object.value))
                                throw $TypeError(".opentelemetry.proto.common.v1.KeyValue.value: object expected");
                            message.value = $root.opentelemetry.proto.common.v1.AnyValue.fromObject(object.value, _depth + 1);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a KeyValue message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {opentelemetry.proto.common.v1.KeyValue} message KeyValue
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    KeyValue.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.defaults) {
                            object.key = "";
                            object.value = null;
                        }
                        if (message.key != null && $Object.hasOwnProperty.call(message, "key"))
                            object.key = message.key;
                        if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                            object.value = $root.opentelemetry.proto.common.v1.AnyValue.toObject(message.value, options, _depth + 1);
                        return object;
                    };

                    /**
                     * Converts this KeyValue to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    KeyValue.prototype.toJSON = function() {
                        return KeyValue.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for KeyValue
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.common.v1.KeyValue
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    KeyValue.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.common.v1.KeyValue";
                    };

                    return KeyValue;
                })();

                v1.InstrumentationScope = (function() {

                    /**
                     * Properties of an InstrumentationScope.
                     * @typedef {Object} opentelemetry.proto.common.v1.InstrumentationScope.$Properties
                     * @property {string|null} [name] InstrumentationScope name
                     * @property {string|null} [version] InstrumentationScope version
                     * @property {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>|null} [attributes] InstrumentationScope attributes
                     * @property {number|null} [droppedAttributesCount] InstrumentationScope droppedAttributesCount
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of an InstrumentationScope.
                     * @memberof opentelemetry.proto.common.v1
                     * @interface IInstrumentationScope
                     * @augments opentelemetry.proto.common.v1.InstrumentationScope.$Properties
                     * @deprecated Use opentelemetry.proto.common.v1.InstrumentationScope.$Properties instead.
                     */

                    /**
                     * Shape of an InstrumentationScope.
                     * @typedef {{
                     *   name?: string|null;
                     *   version?: string|null;
                     *   attributes?: Array.<opentelemetry.proto.common.v1.KeyValue.$Shape>|null;
                     *   droppedAttributesCount?: number|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.common.v1.InstrumentationScope.$Shape
                     */

                    /**
                     * Constructs a new InstrumentationScope.
                     * @memberof opentelemetry.proto.common.v1
                     * @classdesc Represents an InstrumentationScope.
                     * @constructor
                     * @param {opentelemetry.proto.common.v1.InstrumentationScope.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const InstrumentationScope = function (properties) {
                        this.attributes = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * InstrumentationScope name.
                     * @member {string} name
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @instance
                     */
                    InstrumentationScope.prototype.name = "";

                    /**
                     * InstrumentationScope version.
                     * @member {string} version
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @instance
                     */
                    InstrumentationScope.prototype.version = "";

                    /**
                     * InstrumentationScope attributes.
                     * @member {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>} attributes
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @instance
                     */
                    InstrumentationScope.prototype.attributes = $util.emptyArray;

                    /**
                     * InstrumentationScope droppedAttributesCount.
                     * @member {number} droppedAttributesCount
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @instance
                     */
                    InstrumentationScope.prototype.droppedAttributesCount = 0;

                    /**
                     * Creates a new InstrumentationScope instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {opentelemetry.proto.common.v1.InstrumentationScope.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.common.v1.InstrumentationScope} InstrumentationScope instance
                     * @type {{
                     *   (properties: opentelemetry.proto.common.v1.InstrumentationScope.$Shape): opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape;
                     *   (properties?: opentelemetry.proto.common.v1.InstrumentationScope.$Properties): opentelemetry.proto.common.v1.InstrumentationScope;
                     * }}
                     */
                    InstrumentationScope.create = function(properties) {
                        return new InstrumentationScope(properties);
                    };

                    /**
                     * Encodes the specified InstrumentationScope message. Does not implicitly {@link opentelemetry.proto.common.v1.InstrumentationScope.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {opentelemetry.proto.common.v1.InstrumentationScope.$Properties} message InstrumentationScope message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    InstrumentationScope.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.name != null && $Object.hasOwnProperty.call(message, "name") && message.name !== "")
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                        if (message.version != null && $Object.hasOwnProperty.call(message, "version") && message.version !== "")
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.version);
                        if (message.attributes != null && message.attributes.length)
                            for (let i = 0; i < message.attributes.length; ++i)
                                $root.opentelemetry.proto.common.v1.KeyValue.encode(message.attributes[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount") && message.droppedAttributesCount !== 0)
                            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.droppedAttributesCount);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified InstrumentationScope message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.InstrumentationScope.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {opentelemetry.proto.common.v1.InstrumentationScope.$Properties} message InstrumentationScope message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    InstrumentationScope.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes an InstrumentationScope message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape} InstrumentationScope
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    InstrumentationScope.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.common.v1.InstrumentationScope(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.name = value;
                                    else
                                        delete message.name;
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.version = value;
                                    else
                                        delete message.version;
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.attributes && message.attributes.length))
                                        message.attributes = [];
                                    message.attributes.push($root.opentelemetry.proto.common.v1.KeyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 4: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.uint32())
                                        message.droppedAttributesCount = value;
                                    else
                                        delete message.droppedAttributesCount;
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes an InstrumentationScope message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape} InstrumentationScope
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    InstrumentationScope.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an InstrumentationScope message.
                     * @function verify
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    InstrumentationScope.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.version != null && $Object.hasOwnProperty.call(message, "version"))
                            if (!$util.isString(message.version))
                                return "version: string expected";
                        if (message.attributes != null && $Object.hasOwnProperty.call(message, "attributes")) {
                            if (!$Array.isArray(message.attributes))
                                return "attributes: array expected";
                            for (let i = 0; i < message.attributes.length; ++i) {
                                let error = $root.opentelemetry.proto.common.v1.KeyValue.verify(message.attributes[i], _depth + 1);
                                if (error)
                                    return "attributes." + error;
                            }
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            if (!$util.isInteger(message.droppedAttributesCount))
                                return "droppedAttributesCount: integer expected";
                        return null;
                    };

                    /**
                     * Creates an InstrumentationScope message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.common.v1.InstrumentationScope} InstrumentationScope
                     */
                    InstrumentationScope.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.common.v1.InstrumentationScope)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.common.v1.InstrumentationScope: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.common.v1.InstrumentationScope();
                        if (object.name != null)
                            if (typeof object.name !== "string" || object.name.length)
                                message.name = $String(object.name);
                        if (object.version != null)
                            if (typeof object.version !== "string" || object.version.length)
                                message.version = $String(object.version);
                        if (object.attributes) {
                            if (!$Array.isArray(object.attributes))
                                throw $TypeError(".opentelemetry.proto.common.v1.InstrumentationScope.attributes: array expected");
                            message.attributes = $Array(object.attributes.length);
                            for (let i = 0; i < object.attributes.length; ++i) {
                                if (!$util.isObject(object.attributes[i]))
                                    throw $TypeError(".opentelemetry.proto.common.v1.InstrumentationScope.attributes: object expected");
                                message.attributes[i] = $root.opentelemetry.proto.common.v1.KeyValue.fromObject(object.attributes[i], _depth + 1);
                            }
                        }
                        if (object.droppedAttributesCount != null)
                            if ($Number(object.droppedAttributesCount) !== 0)
                                message.droppedAttributesCount = object.droppedAttributesCount >>> 0;
                        return message;
                    };

                    /**
                     * Creates a plain object from an InstrumentationScope message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {opentelemetry.proto.common.v1.InstrumentationScope} message InstrumentationScope
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    InstrumentationScope.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.attributes = [];
                        if (options.defaults) {
                            object.name = "";
                            object.version = "";
                            object.droppedAttributesCount = 0;
                        }
                        if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                            object.name = message.name;
                        if (message.version != null && $Object.hasOwnProperty.call(message, "version"))
                            object.version = message.version;
                        if (message.attributes && message.attributes.length) {
                            object.attributes = $Array(message.attributes.length);
                            for (let j = 0; j < message.attributes.length; ++j)
                                object.attributes[j] = $root.opentelemetry.proto.common.v1.KeyValue.toObject(message.attributes[j], options, _depth + 1);
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            object.droppedAttributesCount = message.droppedAttributesCount;
                        return object;
                    };

                    /**
                     * Converts this InstrumentationScope to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    InstrumentationScope.prototype.toJSON = function() {
                        return InstrumentationScope.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for InstrumentationScope
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.common.v1.InstrumentationScope
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    InstrumentationScope.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.common.v1.InstrumentationScope";
                    };

                    return InstrumentationScope;
                })();

                v1.EntityRef = (function() {

                    /**
                     * Properties of an EntityRef.
                     * @typedef {Object} opentelemetry.proto.common.v1.EntityRef.$Properties
                     * @property {string|null} [schemaUrl] EntityRef schemaUrl
                     * @property {string|null} [type] EntityRef type
                     * @property {Array.<string>|null} [idKeys] EntityRef idKeys
                     * @property {Array.<string>|null} [descriptionKeys] EntityRef descriptionKeys
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of an EntityRef.
                     * @memberof opentelemetry.proto.common.v1
                     * @interface IEntityRef
                     * @augments opentelemetry.proto.common.v1.EntityRef.$Properties
                     * @deprecated Use opentelemetry.proto.common.v1.EntityRef.$Properties instead.
                     */

                    /**
                     * Shape of an EntityRef.
                     * @typedef {opentelemetry.proto.common.v1.EntityRef.$Properties} opentelemetry.proto.common.v1.EntityRef.$Shape
                     */

                    /**
                     * Constructs a new EntityRef.
                     * @memberof opentelemetry.proto.common.v1
                     * @classdesc Represents an EntityRef.
                     * @constructor
                     * @param {opentelemetry.proto.common.v1.EntityRef.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const EntityRef = function (properties) {
                        this.idKeys = [];
                        this.descriptionKeys = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * EntityRef schemaUrl.
                     * @member {string} schemaUrl
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @instance
                     */
                    EntityRef.prototype.schemaUrl = "";

                    /**
                     * EntityRef type.
                     * @member {string} type
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @instance
                     */
                    EntityRef.prototype.type = "";

                    /**
                     * EntityRef idKeys.
                     * @member {Array.<string>} idKeys
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @instance
                     */
                    EntityRef.prototype.idKeys = $util.emptyArray;

                    /**
                     * EntityRef descriptionKeys.
                     * @member {Array.<string>} descriptionKeys
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @instance
                     */
                    EntityRef.prototype.descriptionKeys = $util.emptyArray;

                    /**
                     * Creates a new EntityRef instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {opentelemetry.proto.common.v1.EntityRef.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.common.v1.EntityRef} EntityRef instance
                     * @type {{
                     *   (properties: opentelemetry.proto.common.v1.EntityRef.$Shape): opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape;
                     *   (properties?: opentelemetry.proto.common.v1.EntityRef.$Properties): opentelemetry.proto.common.v1.EntityRef;
                     * }}
                     */
                    EntityRef.create = function(properties) {
                        return new EntityRef(properties);
                    };

                    /**
                     * Encodes the specified EntityRef message. Does not implicitly {@link opentelemetry.proto.common.v1.EntityRef.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {opentelemetry.proto.common.v1.EntityRef.$Properties} message EntityRef message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    EntityRef.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl") && message.schemaUrl !== "")
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.schemaUrl);
                        if (message.type != null && $Object.hasOwnProperty.call(message, "type") && message.type !== "")
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
                        if (message.idKeys != null && message.idKeys.length)
                            for (let i = 0; i < message.idKeys.length; ++i)
                                writer.uint32(/* id 3, wireType 2 =*/26).string(message.idKeys[i]);
                        if (message.descriptionKeys != null && message.descriptionKeys.length)
                            for (let i = 0; i < message.descriptionKeys.length; ++i)
                                writer.uint32(/* id 4, wireType 2 =*/34).string(message.descriptionKeys[i]);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified EntityRef message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.EntityRef.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {opentelemetry.proto.common.v1.EntityRef.$Properties} message EntityRef message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    EntityRef.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes an EntityRef message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape} EntityRef
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    EntityRef.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.common.v1.EntityRef(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.schemaUrl = value;
                                    else
                                        delete message.schemaUrl;
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.type = value;
                                    else
                                        delete message.type;
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.idKeys && message.idKeys.length))
                                        message.idKeys = [];
                                    message.idKeys.push(reader.stringVerify());
                                    continue;
                                }
                            case 4: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.descriptionKeys && message.descriptionKeys.length))
                                        message.descriptionKeys = [];
                                    message.descriptionKeys.push(reader.stringVerify());
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes an EntityRef message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape} EntityRef
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    EntityRef.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an EntityRef message.
                     * @function verify
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    EntityRef.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            if (!$util.isString(message.schemaUrl))
                                return "schemaUrl: string expected";
                        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                            if (!$util.isString(message.type))
                                return "type: string expected";
                        if (message.idKeys != null && $Object.hasOwnProperty.call(message, "idKeys")) {
                            if (!$Array.isArray(message.idKeys))
                                return "idKeys: array expected";
                            for (let i = 0; i < message.idKeys.length; ++i)
                                if (!$util.isString(message.idKeys[i]))
                                    return "idKeys: string[] expected";
                        }
                        if (message.descriptionKeys != null && $Object.hasOwnProperty.call(message, "descriptionKeys")) {
                            if (!$Array.isArray(message.descriptionKeys))
                                return "descriptionKeys: array expected";
                            for (let i = 0; i < message.descriptionKeys.length; ++i)
                                if (!$util.isString(message.descriptionKeys[i]))
                                    return "descriptionKeys: string[] expected";
                        }
                        return null;
                    };

                    /**
                     * Creates an EntityRef message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.common.v1.EntityRef} EntityRef
                     */
                    EntityRef.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.common.v1.EntityRef)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.common.v1.EntityRef: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.common.v1.EntityRef();
                        if (object.schemaUrl != null)
                            if (typeof object.schemaUrl !== "string" || object.schemaUrl.length)
                                message.schemaUrl = $String(object.schemaUrl);
                        if (object.type != null)
                            if (typeof object.type !== "string" || object.type.length)
                                message.type = $String(object.type);
                        if (object.idKeys) {
                            if (!$Array.isArray(object.idKeys))
                                throw $TypeError(".opentelemetry.proto.common.v1.EntityRef.idKeys: array expected");
                            message.idKeys = $Array(object.idKeys.length);
                            for (let i = 0; i < object.idKeys.length; ++i)
                                message.idKeys[i] = $String(object.idKeys[i]);
                        }
                        if (object.descriptionKeys) {
                            if (!$Array.isArray(object.descriptionKeys))
                                throw $TypeError(".opentelemetry.proto.common.v1.EntityRef.descriptionKeys: array expected");
                            message.descriptionKeys = $Array(object.descriptionKeys.length);
                            for (let i = 0; i < object.descriptionKeys.length; ++i)
                                message.descriptionKeys[i] = $String(object.descriptionKeys[i]);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from an EntityRef message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {opentelemetry.proto.common.v1.EntityRef} message EntityRef
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    EntityRef.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults) {
                            object.idKeys = [];
                            object.descriptionKeys = [];
                        }
                        if (options.defaults) {
                            object.schemaUrl = "";
                            object.type = "";
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            object.schemaUrl = message.schemaUrl;
                        if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                            object.type = message.type;
                        if (message.idKeys && message.idKeys.length) {
                            object.idKeys = $Array(message.idKeys.length);
                            for (let j = 0; j < message.idKeys.length; ++j)
                                object.idKeys[j] = message.idKeys[j];
                        }
                        if (message.descriptionKeys && message.descriptionKeys.length) {
                            object.descriptionKeys = $Array(message.descriptionKeys.length);
                            for (let j = 0; j < message.descriptionKeys.length; ++j)
                                object.descriptionKeys[j] = message.descriptionKeys[j];
                        }
                        return object;
                    };

                    /**
                     * Converts this EntityRef to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    EntityRef.prototype.toJSON = function() {
                        return EntityRef.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for EntityRef
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.common.v1.EntityRef
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    EntityRef.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.common.v1.EntityRef";
                    };

                    return EntityRef;
                })();

                return v1;
            })();

            return common;
        })();

        proto.resource = (function() {

            /**
             * Namespace resource.
             * @memberof opentelemetry.proto
             * @namespace
             */
            const resource = {};

            resource.v1 = (function() {

                /**
                 * Namespace v1.
                 * @memberof opentelemetry.proto.resource
                 * @namespace
                 */
                const v1 = {};

                v1.Resource = (function() {

                    /**
                     * Properties of a Resource.
                     * @typedef {Object} opentelemetry.proto.resource.v1.Resource.$Properties
                     * @property {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>|null} [attributes] Resource attributes
                     * @property {number|null} [droppedAttributesCount] Resource droppedAttributesCount
                     * @property {Array.<opentelemetry.proto.common.v1.EntityRef.$Properties>|null} [entityRefs] Resource entityRefs
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a Resource.
                     * @memberof opentelemetry.proto.resource.v1
                     * @interface IResource
                     * @augments opentelemetry.proto.resource.v1.Resource.$Properties
                     * @deprecated Use opentelemetry.proto.resource.v1.Resource.$Properties instead.
                     */

                    /**
                     * Shape of a Resource.
                     * @typedef {{
                     *   attributes?: Array.<opentelemetry.proto.common.v1.KeyValue.$Shape>|null;
                     *   droppedAttributesCount?: number|null;
                     *   entityRefs?: Array.<opentelemetry.proto.common.v1.EntityRef.$Shape>|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.resource.v1.Resource.$Shape
                     */

                    /**
                     * Constructs a new Resource.
                     * @memberof opentelemetry.proto.resource.v1
                     * @classdesc Represents a Resource.
                     * @constructor
                     * @param {opentelemetry.proto.resource.v1.Resource.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const Resource = function (properties) {
                        this.attributes = [];
                        this.entityRefs = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * Resource attributes.
                     * @member {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>} attributes
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @instance
                     */
                    Resource.prototype.attributes = $util.emptyArray;

                    /**
                     * Resource droppedAttributesCount.
                     * @member {number} droppedAttributesCount
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @instance
                     */
                    Resource.prototype.droppedAttributesCount = 0;

                    /**
                     * Resource entityRefs.
                     * @member {Array.<opentelemetry.proto.common.v1.EntityRef.$Properties>} entityRefs
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @instance
                     */
                    Resource.prototype.entityRefs = $util.emptyArray;

                    /**
                     * Creates a new Resource instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {opentelemetry.proto.resource.v1.Resource.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.resource.v1.Resource} Resource instance
                     * @type {{
                     *   (properties: opentelemetry.proto.resource.v1.Resource.$Shape): opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape;
                     *   (properties?: opentelemetry.proto.resource.v1.Resource.$Properties): opentelemetry.proto.resource.v1.Resource;
                     * }}
                     */
                    Resource.create = function(properties) {
                        return new Resource(properties);
                    };

                    /**
                     * Encodes the specified Resource message. Does not implicitly {@link opentelemetry.proto.resource.v1.Resource.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {opentelemetry.proto.resource.v1.Resource.$Properties} message Resource message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Resource.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.attributes != null && message.attributes.length)
                            for (let i = 0; i < message.attributes.length; ++i)
                                $root.opentelemetry.proto.common.v1.KeyValue.encode(message.attributes[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount") && message.droppedAttributesCount !== 0)
                            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.droppedAttributesCount);
                        if (message.entityRefs != null && message.entityRefs.length)
                            for (let i = 0; i < message.entityRefs.length; ++i)
                                $root.opentelemetry.proto.common.v1.EntityRef.encode(message.entityRefs[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified Resource message, length delimited. Does not implicitly {@link opentelemetry.proto.resource.v1.Resource.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {opentelemetry.proto.resource.v1.Resource.$Properties} message Resource message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Resource.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a Resource message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape} Resource
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Resource.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.resource.v1.Resource(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.attributes && message.attributes.length))
                                        message.attributes = [];
                                    message.attributes.push($root.opentelemetry.proto.common.v1.KeyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.uint32())
                                        message.droppedAttributesCount = value;
                                    else
                                        delete message.droppedAttributesCount;
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.entityRefs && message.entityRefs.length))
                                        message.entityRefs = [];
                                    message.entityRefs.push($root.opentelemetry.proto.common.v1.EntityRef.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a Resource message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape} Resource
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Resource.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Resource message.
                     * @function verify
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Resource.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.attributes != null && $Object.hasOwnProperty.call(message, "attributes")) {
                            if (!$Array.isArray(message.attributes))
                                return "attributes: array expected";
                            for (let i = 0; i < message.attributes.length; ++i) {
                                let error = $root.opentelemetry.proto.common.v1.KeyValue.verify(message.attributes[i], _depth + 1);
                                if (error)
                                    return "attributes." + error;
                            }
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            if (!$util.isInteger(message.droppedAttributesCount))
                                return "droppedAttributesCount: integer expected";
                        if (message.entityRefs != null && $Object.hasOwnProperty.call(message, "entityRefs")) {
                            if (!$Array.isArray(message.entityRefs))
                                return "entityRefs: array expected";
                            for (let i = 0; i < message.entityRefs.length; ++i) {
                                let error = $root.opentelemetry.proto.common.v1.EntityRef.verify(message.entityRefs[i], _depth + 1);
                                if (error)
                                    return "entityRefs." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a Resource message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.resource.v1.Resource} Resource
                     */
                    Resource.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.resource.v1.Resource)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.resource.v1.Resource: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.resource.v1.Resource();
                        if (object.attributes) {
                            if (!$Array.isArray(object.attributes))
                                throw $TypeError(".opentelemetry.proto.resource.v1.Resource.attributes: array expected");
                            message.attributes = $Array(object.attributes.length);
                            for (let i = 0; i < object.attributes.length; ++i) {
                                if (!$util.isObject(object.attributes[i]))
                                    throw $TypeError(".opentelemetry.proto.resource.v1.Resource.attributes: object expected");
                                message.attributes[i] = $root.opentelemetry.proto.common.v1.KeyValue.fromObject(object.attributes[i], _depth + 1);
                            }
                        }
                        if (object.droppedAttributesCount != null)
                            if ($Number(object.droppedAttributesCount) !== 0)
                                message.droppedAttributesCount = object.droppedAttributesCount >>> 0;
                        if (object.entityRefs) {
                            if (!$Array.isArray(object.entityRefs))
                                throw $TypeError(".opentelemetry.proto.resource.v1.Resource.entityRefs: array expected");
                            message.entityRefs = $Array(object.entityRefs.length);
                            for (let i = 0; i < object.entityRefs.length; ++i) {
                                if (!$util.isObject(object.entityRefs[i]))
                                    throw $TypeError(".opentelemetry.proto.resource.v1.Resource.entityRefs: object expected");
                                message.entityRefs[i] = $root.opentelemetry.proto.common.v1.EntityRef.fromObject(object.entityRefs[i], _depth + 1);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Resource message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {opentelemetry.proto.resource.v1.Resource} message Resource
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Resource.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults) {
                            object.attributes = [];
                            object.entityRefs = [];
                        }
                        if (options.defaults)
                            object.droppedAttributesCount = 0;
                        if (message.attributes && message.attributes.length) {
                            object.attributes = $Array(message.attributes.length);
                            for (let j = 0; j < message.attributes.length; ++j)
                                object.attributes[j] = $root.opentelemetry.proto.common.v1.KeyValue.toObject(message.attributes[j], options, _depth + 1);
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            object.droppedAttributesCount = message.droppedAttributesCount;
                        if (message.entityRefs && message.entityRefs.length) {
                            object.entityRefs = $Array(message.entityRefs.length);
                            for (let j = 0; j < message.entityRefs.length; ++j)
                                object.entityRefs[j] = $root.opentelemetry.proto.common.v1.EntityRef.toObject(message.entityRefs[j], options, _depth + 1);
                        }
                        return object;
                    };

                    /**
                     * Converts this Resource to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Resource.prototype.toJSON = function() {
                        return Resource.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for Resource
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.resource.v1.Resource
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    Resource.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.resource.v1.Resource";
                    };

                    return Resource;
                })();

                return v1;
            })();

            return resource;
        })();

        proto.logs = (function() {

            /**
             * Namespace logs.
             * @memberof opentelemetry.proto
             * @namespace
             */
            const logs = {};

            logs.v1 = (function() {

                /**
                 * Namespace v1.
                 * @memberof opentelemetry.proto.logs
                 * @namespace
                 */
                const v1 = {};

                v1.LogsData = (function() {

                    /**
                     * Properties of a LogsData.
                     * @typedef {Object} opentelemetry.proto.logs.v1.LogsData.$Properties
                     * @property {Array.<opentelemetry.proto.logs.v1.ResourceLogs.$Properties>|null} [resourceLogs] LogsData resourceLogs
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a LogsData.
                     * @memberof opentelemetry.proto.logs.v1
                     * @interface ILogsData
                     * @augments opentelemetry.proto.logs.v1.LogsData.$Properties
                     * @deprecated Use opentelemetry.proto.logs.v1.LogsData.$Properties instead.
                     */

                    /**
                     * Shape of a LogsData.
                     * @typedef {{
                     *   resourceLogs?: Array.<opentelemetry.proto.logs.v1.ResourceLogs.$Shape>|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.logs.v1.LogsData.$Shape
                     */

                    /**
                     * Constructs a new LogsData.
                     * @memberof opentelemetry.proto.logs.v1
                     * @classdesc Represents a LogsData.
                     * @constructor
                     * @param {opentelemetry.proto.logs.v1.LogsData.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const LogsData = function (properties) {
                        this.resourceLogs = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * LogsData resourceLogs.
                     * @member {Array.<opentelemetry.proto.logs.v1.ResourceLogs.$Properties>} resourceLogs
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @instance
                     */
                    LogsData.prototype.resourceLogs = $util.emptyArray;

                    /**
                     * Creates a new LogsData instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogsData.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.logs.v1.LogsData} LogsData instance
                     * @type {{
                     *   (properties: opentelemetry.proto.logs.v1.LogsData.$Shape): opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape;
                     *   (properties?: opentelemetry.proto.logs.v1.LogsData.$Properties): opentelemetry.proto.logs.v1.LogsData;
                     * }}
                     */
                    LogsData.create = function(properties) {
                        return new LogsData(properties);
                    };

                    /**
                     * Encodes the specified LogsData message. Does not implicitly {@link opentelemetry.proto.logs.v1.LogsData.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogsData.$Properties} message LogsData message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    LogsData.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.resourceLogs != null && message.resourceLogs.length)
                            for (let i = 0; i < message.resourceLogs.length; ++i)
                                $root.opentelemetry.proto.logs.v1.ResourceLogs.encode(message.resourceLogs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified LogsData message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.LogsData.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogsData.$Properties} message LogsData message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    LogsData.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a LogsData message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape} LogsData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    LogsData.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.logs.v1.LogsData();
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.resourceLogs && message.resourceLogs.length))
                                        message.resourceLogs = [];
                                    message.resourceLogs.push($root.opentelemetry.proto.logs.v1.ResourceLogs.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a LogsData message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape} LogsData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    LogsData.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a LogsData message.
                     * @function verify
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    LogsData.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.resourceLogs != null && $Object.hasOwnProperty.call(message, "resourceLogs")) {
                            if (!$Array.isArray(message.resourceLogs))
                                return "resourceLogs: array expected";
                            for (let i = 0; i < message.resourceLogs.length; ++i) {
                                let error = $root.opentelemetry.proto.logs.v1.ResourceLogs.verify(message.resourceLogs[i], _depth + 1);
                                if (error)
                                    return "resourceLogs." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a LogsData message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.logs.v1.LogsData} LogsData
                     */
                    LogsData.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.logs.v1.LogsData)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.logs.v1.LogsData: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.logs.v1.LogsData();
                        if (object.resourceLogs) {
                            if (!$Array.isArray(object.resourceLogs))
                                throw $TypeError(".opentelemetry.proto.logs.v1.LogsData.resourceLogs: array expected");
                            message.resourceLogs = $Array(object.resourceLogs.length);
                            for (let i = 0; i < object.resourceLogs.length; ++i) {
                                if (!$util.isObject(object.resourceLogs[i]))
                                    throw $TypeError(".opentelemetry.proto.logs.v1.LogsData.resourceLogs: object expected");
                                message.resourceLogs[i] = $root.opentelemetry.proto.logs.v1.ResourceLogs.fromObject(object.resourceLogs[i], _depth + 1);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a LogsData message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogsData} message LogsData
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    LogsData.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.resourceLogs = [];
                        if (message.resourceLogs && message.resourceLogs.length) {
                            object.resourceLogs = $Array(message.resourceLogs.length);
                            for (let j = 0; j < message.resourceLogs.length; ++j)
                                object.resourceLogs[j] = $root.opentelemetry.proto.logs.v1.ResourceLogs.toObject(message.resourceLogs[j], options, _depth + 1);
                        }
                        return object;
                    };

                    /**
                     * Converts this LogsData to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    LogsData.prototype.toJSON = function() {
                        return LogsData.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for LogsData
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.logs.v1.LogsData
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    LogsData.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.logs.v1.LogsData";
                    };

                    return LogsData;
                })();

                v1.ResourceLogs = (function() {

                    /**
                     * Properties of a ResourceLogs.
                     * @typedef {Object} opentelemetry.proto.logs.v1.ResourceLogs.$Properties
                     * @property {opentelemetry.proto.resource.v1.Resource.$Properties|null} [resource] ResourceLogs resource
                     * @property {Array.<opentelemetry.proto.logs.v1.ScopeLogs.$Properties>|null} [scopeLogs] ResourceLogs scopeLogs
                     * @property {string|null} [schemaUrl] ResourceLogs schemaUrl
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a ResourceLogs.
                     * @memberof opentelemetry.proto.logs.v1
                     * @interface IResourceLogs
                     * @augments opentelemetry.proto.logs.v1.ResourceLogs.$Properties
                     * @deprecated Use opentelemetry.proto.logs.v1.ResourceLogs.$Properties instead.
                     */

                    /**
                     * Shape of a ResourceLogs.
                     * @typedef {{
                     *   resource?: opentelemetry.proto.resource.v1.Resource.$Shape|null;
                     *   scopeLogs?: Array.<opentelemetry.proto.logs.v1.ScopeLogs.$Shape>|null;
                     *   schemaUrl?: string|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.logs.v1.ResourceLogs.$Shape
                     */

                    /**
                     * Constructs a new ResourceLogs.
                     * @memberof opentelemetry.proto.logs.v1
                     * @classdesc Represents a ResourceLogs.
                     * @constructor
                     * @param {opentelemetry.proto.logs.v1.ResourceLogs.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const ResourceLogs = function (properties) {
                        this.scopeLogs = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * ResourceLogs resource.
                     * @member {opentelemetry.proto.resource.v1.Resource.$Properties|null|undefined} resource
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @instance
                     */
                    ResourceLogs.prototype.resource = null;

                    /**
                     * ResourceLogs scopeLogs.
                     * @member {Array.<opentelemetry.proto.logs.v1.ScopeLogs.$Properties>} scopeLogs
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @instance
                     */
                    ResourceLogs.prototype.scopeLogs = $util.emptyArray;

                    /**
                     * ResourceLogs schemaUrl.
                     * @member {string} schemaUrl
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @instance
                     */
                    ResourceLogs.prototype.schemaUrl = "";

                    /**
                     * Creates a new ResourceLogs instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ResourceLogs.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.logs.v1.ResourceLogs} ResourceLogs instance
                     * @type {{
                     *   (properties: opentelemetry.proto.logs.v1.ResourceLogs.$Shape): opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape;
                     *   (properties?: opentelemetry.proto.logs.v1.ResourceLogs.$Properties): opentelemetry.proto.logs.v1.ResourceLogs;
                     * }}
                     */
                    ResourceLogs.create = function(properties) {
                        return new ResourceLogs(properties);
                    };

                    /**
                     * Encodes the specified ResourceLogs message. Does not implicitly {@link opentelemetry.proto.logs.v1.ResourceLogs.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ResourceLogs.$Properties} message ResourceLogs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ResourceLogs.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.resource != null && $Object.hasOwnProperty.call(message, "resource"))
                            $root.opentelemetry.proto.resource.v1.Resource.encode(message.resource, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.scopeLogs != null && message.scopeLogs.length)
                            for (let i = 0; i < message.scopeLogs.length; ++i)
                                $root.opentelemetry.proto.logs.v1.ScopeLogs.encode(message.scopeLogs[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl") && message.schemaUrl !== "")
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.schemaUrl);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified ResourceLogs message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.ResourceLogs.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ResourceLogs.$Properties} message ResourceLogs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ResourceLogs.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a ResourceLogs message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape} ResourceLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ResourceLogs.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.logs.v1.ResourceLogs(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    message.resource = $root.opentelemetry.proto.resource.v1.Resource.decode(reader, reader.uint32(), $undefined, _depth + 1, message.resource);
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.scopeLogs && message.scopeLogs.length))
                                        message.scopeLogs = [];
                                    message.scopeLogs.push($root.opentelemetry.proto.logs.v1.ScopeLogs.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.schemaUrl = value;
                                    else
                                        delete message.schemaUrl;
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a ResourceLogs message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape} ResourceLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ResourceLogs.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ResourceLogs message.
                     * @function verify
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ResourceLogs.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.resource != null && $Object.hasOwnProperty.call(message, "resource")) {
                            let error = $root.opentelemetry.proto.resource.v1.Resource.verify(message.resource, _depth + 1);
                            if (error)
                                return "resource." + error;
                        }
                        if (message.scopeLogs != null && $Object.hasOwnProperty.call(message, "scopeLogs")) {
                            if (!$Array.isArray(message.scopeLogs))
                                return "scopeLogs: array expected";
                            for (let i = 0; i < message.scopeLogs.length; ++i) {
                                let error = $root.opentelemetry.proto.logs.v1.ScopeLogs.verify(message.scopeLogs[i], _depth + 1);
                                if (error)
                                    return "scopeLogs." + error;
                            }
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            if (!$util.isString(message.schemaUrl))
                                return "schemaUrl: string expected";
                        return null;
                    };

                    /**
                     * Creates a ResourceLogs message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.logs.v1.ResourceLogs} ResourceLogs
                     */
                    ResourceLogs.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.logs.v1.ResourceLogs)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.logs.v1.ResourceLogs: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.logs.v1.ResourceLogs();
                        if (object.resource != null) {
                            if (!$util.isObject(object.resource))
                                throw $TypeError(".opentelemetry.proto.logs.v1.ResourceLogs.resource: object expected");
                            message.resource = $root.opentelemetry.proto.resource.v1.Resource.fromObject(object.resource, _depth + 1);
                        }
                        if (object.scopeLogs) {
                            if (!$Array.isArray(object.scopeLogs))
                                throw $TypeError(".opentelemetry.proto.logs.v1.ResourceLogs.scopeLogs: array expected");
                            message.scopeLogs = $Array(object.scopeLogs.length);
                            for (let i = 0; i < object.scopeLogs.length; ++i) {
                                if (!$util.isObject(object.scopeLogs[i]))
                                    throw $TypeError(".opentelemetry.proto.logs.v1.ResourceLogs.scopeLogs: object expected");
                                message.scopeLogs[i] = $root.opentelemetry.proto.logs.v1.ScopeLogs.fromObject(object.scopeLogs[i], _depth + 1);
                            }
                        }
                        if (object.schemaUrl != null)
                            if (typeof object.schemaUrl !== "string" || object.schemaUrl.length)
                                message.schemaUrl = $String(object.schemaUrl);
                        return message;
                    };

                    /**
                     * Creates a plain object from a ResourceLogs message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ResourceLogs} message ResourceLogs
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ResourceLogs.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.scopeLogs = [];
                        if (options.defaults) {
                            object.resource = null;
                            object.schemaUrl = "";
                        }
                        if (message.resource != null && $Object.hasOwnProperty.call(message, "resource"))
                            object.resource = $root.opentelemetry.proto.resource.v1.Resource.toObject(message.resource, options, _depth + 1);
                        if (message.scopeLogs && message.scopeLogs.length) {
                            object.scopeLogs = $Array(message.scopeLogs.length);
                            for (let j = 0; j < message.scopeLogs.length; ++j)
                                object.scopeLogs[j] = $root.opentelemetry.proto.logs.v1.ScopeLogs.toObject(message.scopeLogs[j], options, _depth + 1);
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            object.schemaUrl = message.schemaUrl;
                        return object;
                    };

                    /**
                     * Converts this ResourceLogs to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ResourceLogs.prototype.toJSON = function() {
                        return ResourceLogs.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for ResourceLogs
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.logs.v1.ResourceLogs
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    ResourceLogs.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.logs.v1.ResourceLogs";
                    };

                    return ResourceLogs;
                })();

                v1.ScopeLogs = (function() {

                    /**
                     * Properties of a ScopeLogs.
                     * @typedef {Object} opentelemetry.proto.logs.v1.ScopeLogs.$Properties
                     * @property {opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null} [scope] ScopeLogs scope
                     * @property {Array.<opentelemetry.proto.logs.v1.LogRecord.$Properties>|null} [logRecords] ScopeLogs logRecords
                     * @property {string|null} [schemaUrl] ScopeLogs schemaUrl
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a ScopeLogs.
                     * @memberof opentelemetry.proto.logs.v1
                     * @interface IScopeLogs
                     * @augments opentelemetry.proto.logs.v1.ScopeLogs.$Properties
                     * @deprecated Use opentelemetry.proto.logs.v1.ScopeLogs.$Properties instead.
                     */

                    /**
                     * Shape of a ScopeLogs.
                     * @typedef {{
                     *   scope?: opentelemetry.proto.common.v1.InstrumentationScope.$Shape|null;
                     *   logRecords?: Array.<opentelemetry.proto.logs.v1.LogRecord.$Shape>|null;
                     *   schemaUrl?: string|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.logs.v1.ScopeLogs.$Shape
                     */

                    /**
                     * Constructs a new ScopeLogs.
                     * @memberof opentelemetry.proto.logs.v1
                     * @classdesc Represents a ScopeLogs.
                     * @constructor
                     * @param {opentelemetry.proto.logs.v1.ScopeLogs.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const ScopeLogs = function (properties) {
                        this.logRecords = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * ScopeLogs scope.
                     * @member {opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null|undefined} scope
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @instance
                     */
                    ScopeLogs.prototype.scope = null;

                    /**
                     * ScopeLogs logRecords.
                     * @member {Array.<opentelemetry.proto.logs.v1.LogRecord.$Properties>} logRecords
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @instance
                     */
                    ScopeLogs.prototype.logRecords = $util.emptyArray;

                    /**
                     * ScopeLogs schemaUrl.
                     * @member {string} schemaUrl
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @instance
                     */
                    ScopeLogs.prototype.schemaUrl = "";

                    /**
                     * Creates a new ScopeLogs instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ScopeLogs.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.logs.v1.ScopeLogs} ScopeLogs instance
                     * @type {{
                     *   (properties: opentelemetry.proto.logs.v1.ScopeLogs.$Shape): opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape;
                     *   (properties?: opentelemetry.proto.logs.v1.ScopeLogs.$Properties): opentelemetry.proto.logs.v1.ScopeLogs;
                     * }}
                     */
                    ScopeLogs.create = function(properties) {
                        return new ScopeLogs(properties);
                    };

                    /**
                     * Encodes the specified ScopeLogs message. Does not implicitly {@link opentelemetry.proto.logs.v1.ScopeLogs.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ScopeLogs.$Properties} message ScopeLogs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ScopeLogs.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.scope != null && $Object.hasOwnProperty.call(message, "scope"))
                            $root.opentelemetry.proto.common.v1.InstrumentationScope.encode(message.scope, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                        if (message.logRecords != null && message.logRecords.length)
                            for (let i = 0; i < message.logRecords.length; ++i)
                                $root.opentelemetry.proto.logs.v1.LogRecord.encode(message.logRecords[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl") && message.schemaUrl !== "")
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.schemaUrl);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified ScopeLogs message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.ScopeLogs.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ScopeLogs.$Properties} message ScopeLogs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ScopeLogs.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a ScopeLogs message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape} ScopeLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ScopeLogs.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.logs.v1.ScopeLogs(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 2)
                                        break;
                                    message.scope = $root.opentelemetry.proto.common.v1.InstrumentationScope.decode(reader, reader.uint32(), $undefined, _depth + 1, message.scope);
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.logRecords && message.logRecords.length))
                                        message.logRecords = [];
                                    message.logRecords.push($root.opentelemetry.proto.logs.v1.LogRecord.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.schemaUrl = value;
                                    else
                                        delete message.schemaUrl;
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a ScopeLogs message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape} ScopeLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    ScopeLogs.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ScopeLogs message.
                     * @function verify
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ScopeLogs.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.scope != null && $Object.hasOwnProperty.call(message, "scope")) {
                            let error = $root.opentelemetry.proto.common.v1.InstrumentationScope.verify(message.scope, _depth + 1);
                            if (error)
                                return "scope." + error;
                        }
                        if (message.logRecords != null && $Object.hasOwnProperty.call(message, "logRecords")) {
                            if (!$Array.isArray(message.logRecords))
                                return "logRecords: array expected";
                            for (let i = 0; i < message.logRecords.length; ++i) {
                                let error = $root.opentelemetry.proto.logs.v1.LogRecord.verify(message.logRecords[i], _depth + 1);
                                if (error)
                                    return "logRecords." + error;
                            }
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            if (!$util.isString(message.schemaUrl))
                                return "schemaUrl: string expected";
                        return null;
                    };

                    /**
                     * Creates a ScopeLogs message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.logs.v1.ScopeLogs} ScopeLogs
                     */
                    ScopeLogs.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.logs.v1.ScopeLogs)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.logs.v1.ScopeLogs: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.logs.v1.ScopeLogs();
                        if (object.scope != null) {
                            if (!$util.isObject(object.scope))
                                throw $TypeError(".opentelemetry.proto.logs.v1.ScopeLogs.scope: object expected");
                            message.scope = $root.opentelemetry.proto.common.v1.InstrumentationScope.fromObject(object.scope, _depth + 1);
                        }
                        if (object.logRecords) {
                            if (!$Array.isArray(object.logRecords))
                                throw $TypeError(".opentelemetry.proto.logs.v1.ScopeLogs.logRecords: array expected");
                            message.logRecords = $Array(object.logRecords.length);
                            for (let i = 0; i < object.logRecords.length; ++i) {
                                if (!$util.isObject(object.logRecords[i]))
                                    throw $TypeError(".opentelemetry.proto.logs.v1.ScopeLogs.logRecords: object expected");
                                message.logRecords[i] = $root.opentelemetry.proto.logs.v1.LogRecord.fromObject(object.logRecords[i], _depth + 1);
                            }
                        }
                        if (object.schemaUrl != null)
                            if (typeof object.schemaUrl !== "string" || object.schemaUrl.length)
                                message.schemaUrl = $String(object.schemaUrl);
                        return message;
                    };

                    /**
                     * Creates a plain object from a ScopeLogs message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {opentelemetry.proto.logs.v1.ScopeLogs} message ScopeLogs
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ScopeLogs.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.logRecords = [];
                        if (options.defaults) {
                            object.scope = null;
                            object.schemaUrl = "";
                        }
                        if (message.scope != null && $Object.hasOwnProperty.call(message, "scope"))
                            object.scope = $root.opentelemetry.proto.common.v1.InstrumentationScope.toObject(message.scope, options, _depth + 1);
                        if (message.logRecords && message.logRecords.length) {
                            object.logRecords = $Array(message.logRecords.length);
                            for (let j = 0; j < message.logRecords.length; ++j)
                                object.logRecords[j] = $root.opentelemetry.proto.logs.v1.LogRecord.toObject(message.logRecords[j], options, _depth + 1);
                        }
                        if (message.schemaUrl != null && $Object.hasOwnProperty.call(message, "schemaUrl"))
                            object.schemaUrl = message.schemaUrl;
                        return object;
                    };

                    /**
                     * Converts this ScopeLogs to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ScopeLogs.prototype.toJSON = function() {
                        return ScopeLogs.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for ScopeLogs
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.logs.v1.ScopeLogs
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    ScopeLogs.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.logs.v1.ScopeLogs";
                    };

                    return ScopeLogs;
                })();

                /**
                 * SeverityNumber enum.
                 * @name opentelemetry.proto.logs.v1.SeverityNumber
                 * @enum {number}
                 * @property {number} SEVERITY_NUMBER_UNSPECIFIED=0 SEVERITY_NUMBER_UNSPECIFIED value
                 * @property {number} SEVERITY_NUMBER_TRACE=1 SEVERITY_NUMBER_TRACE value
                 * @property {number} SEVERITY_NUMBER_TRACE2=2 SEVERITY_NUMBER_TRACE2 value
                 * @property {number} SEVERITY_NUMBER_TRACE3=3 SEVERITY_NUMBER_TRACE3 value
                 * @property {number} SEVERITY_NUMBER_TRACE4=4 SEVERITY_NUMBER_TRACE4 value
                 * @property {number} SEVERITY_NUMBER_DEBUG=5 SEVERITY_NUMBER_DEBUG value
                 * @property {number} SEVERITY_NUMBER_DEBUG2=6 SEVERITY_NUMBER_DEBUG2 value
                 * @property {number} SEVERITY_NUMBER_DEBUG3=7 SEVERITY_NUMBER_DEBUG3 value
                 * @property {number} SEVERITY_NUMBER_DEBUG4=8 SEVERITY_NUMBER_DEBUG4 value
                 * @property {number} SEVERITY_NUMBER_INFO=9 SEVERITY_NUMBER_INFO value
                 * @property {number} SEVERITY_NUMBER_INFO2=10 SEVERITY_NUMBER_INFO2 value
                 * @property {number} SEVERITY_NUMBER_INFO3=11 SEVERITY_NUMBER_INFO3 value
                 * @property {number} SEVERITY_NUMBER_INFO4=12 SEVERITY_NUMBER_INFO4 value
                 * @property {number} SEVERITY_NUMBER_WARN=13 SEVERITY_NUMBER_WARN value
                 * @property {number} SEVERITY_NUMBER_WARN2=14 SEVERITY_NUMBER_WARN2 value
                 * @property {number} SEVERITY_NUMBER_WARN3=15 SEVERITY_NUMBER_WARN3 value
                 * @property {number} SEVERITY_NUMBER_WARN4=16 SEVERITY_NUMBER_WARN4 value
                 * @property {number} SEVERITY_NUMBER_ERROR=17 SEVERITY_NUMBER_ERROR value
                 * @property {number} SEVERITY_NUMBER_ERROR2=18 SEVERITY_NUMBER_ERROR2 value
                 * @property {number} SEVERITY_NUMBER_ERROR3=19 SEVERITY_NUMBER_ERROR3 value
                 * @property {number} SEVERITY_NUMBER_ERROR4=20 SEVERITY_NUMBER_ERROR4 value
                 * @property {number} SEVERITY_NUMBER_FATAL=21 SEVERITY_NUMBER_FATAL value
                 * @property {number} SEVERITY_NUMBER_FATAL2=22 SEVERITY_NUMBER_FATAL2 value
                 * @property {number} SEVERITY_NUMBER_FATAL3=23 SEVERITY_NUMBER_FATAL3 value
                 * @property {number} SEVERITY_NUMBER_FATAL4=24 SEVERITY_NUMBER_FATAL4 value
                 */
                v1.SeverityNumber = (function() {
                    const valuesById = $Object.create(null), values = $Object.create(valuesById);
                    values[valuesById[0] = "SEVERITY_NUMBER_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "SEVERITY_NUMBER_TRACE"] = 1;
                    values[valuesById[2] = "SEVERITY_NUMBER_TRACE2"] = 2;
                    values[valuesById[3] = "SEVERITY_NUMBER_TRACE3"] = 3;
                    values[valuesById[4] = "SEVERITY_NUMBER_TRACE4"] = 4;
                    values[valuesById[5] = "SEVERITY_NUMBER_DEBUG"] = 5;
                    values[valuesById[6] = "SEVERITY_NUMBER_DEBUG2"] = 6;
                    values[valuesById[7] = "SEVERITY_NUMBER_DEBUG3"] = 7;
                    values[valuesById[8] = "SEVERITY_NUMBER_DEBUG4"] = 8;
                    values[valuesById[9] = "SEVERITY_NUMBER_INFO"] = 9;
                    values[valuesById[10] = "SEVERITY_NUMBER_INFO2"] = 10;
                    values[valuesById[11] = "SEVERITY_NUMBER_INFO3"] = 11;
                    values[valuesById[12] = "SEVERITY_NUMBER_INFO4"] = 12;
                    values[valuesById[13] = "SEVERITY_NUMBER_WARN"] = 13;
                    values[valuesById[14] = "SEVERITY_NUMBER_WARN2"] = 14;
                    values[valuesById[15] = "SEVERITY_NUMBER_WARN3"] = 15;
                    values[valuesById[16] = "SEVERITY_NUMBER_WARN4"] = 16;
                    values[valuesById[17] = "SEVERITY_NUMBER_ERROR"] = 17;
                    values[valuesById[18] = "SEVERITY_NUMBER_ERROR2"] = 18;
                    values[valuesById[19] = "SEVERITY_NUMBER_ERROR3"] = 19;
                    values[valuesById[20] = "SEVERITY_NUMBER_ERROR4"] = 20;
                    values[valuesById[21] = "SEVERITY_NUMBER_FATAL"] = 21;
                    values[valuesById[22] = "SEVERITY_NUMBER_FATAL2"] = 22;
                    values[valuesById[23] = "SEVERITY_NUMBER_FATAL3"] = 23;
                    values[valuesById[24] = "SEVERITY_NUMBER_FATAL4"] = 24;
                    return values;
                })();

                /**
                 * LogRecordFlags enum.
                 * @name opentelemetry.proto.logs.v1.LogRecordFlags
                 * @enum {number}
                 * @property {number} LOG_RECORD_FLAGS_DO_NOT_USE=0 LOG_RECORD_FLAGS_DO_NOT_USE value
                 * @property {number} LOG_RECORD_FLAGS_TRACE_FLAGS_MASK=255 LOG_RECORD_FLAGS_TRACE_FLAGS_MASK value
                 */
                v1.LogRecordFlags = (function() {
                    const valuesById = $Object.create(null), values = $Object.create(valuesById);
                    values[valuesById[0] = "LOG_RECORD_FLAGS_DO_NOT_USE"] = 0;
                    values[valuesById[255] = "LOG_RECORD_FLAGS_TRACE_FLAGS_MASK"] = 255;
                    return values;
                })();

                v1.LogRecord = (function() {

                    /**
                     * Properties of a LogRecord.
                     * @typedef {Object} opentelemetry.proto.logs.v1.LogRecord.$Properties
                     * @property {number|Long|null} [timeUnixNano] LogRecord timeUnixNano
                     * @property {number|Long|null} [observedTimeUnixNano] LogRecord observedTimeUnixNano
                     * @property {opentelemetry.proto.logs.v1.SeverityNumber|null} [severityNumber] LogRecord severityNumber
                     * @property {string|null} [severityText] LogRecord severityText
                     * @property {opentelemetry.proto.common.v1.AnyValue.$Properties|null} [body] LogRecord body
                     * @property {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>|null} [attributes] LogRecord attributes
                     * @property {number|null} [droppedAttributesCount] LogRecord droppedAttributesCount
                     * @property {number|null} [flags] LogRecord flags
                     * @property {Uint8Array|null} [traceId] LogRecord traceId
                     * @property {Uint8Array|null} [spanId] LogRecord spanId
                     * @property {string|null} [eventName] LogRecord eventName
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */

                    /**
                     * Properties of a LogRecord.
                     * @memberof opentelemetry.proto.logs.v1
                     * @interface ILogRecord
                     * @augments opentelemetry.proto.logs.v1.LogRecord.$Properties
                     * @deprecated Use opentelemetry.proto.logs.v1.LogRecord.$Properties instead.
                     */

                    /**
                     * Shape of a LogRecord.
                     * @typedef {{
                     *   timeUnixNano?: number|Long|null;
                     *   observedTimeUnixNano?: number|Long|null;
                     *   severityNumber?: opentelemetry.proto.logs.v1.SeverityNumber|null;
                     *   severityText?: string|null;
                     *   body?: opentelemetry.proto.common.v1.AnyValue.$Shape|null;
                     *   attributes?: Array.<opentelemetry.proto.common.v1.KeyValue.$Shape>|null;
                     *   droppedAttributesCount?: number|null;
                     *   flags?: number|null;
                     *   traceId?: Uint8Array|null;
                     *   spanId?: Uint8Array|null;
                     *   eventName?: string|null;
                     *   $unknowns?: Array.<Uint8Array>;
                     * }} opentelemetry.proto.logs.v1.LogRecord.$Shape
                     */

                    /**
                     * Constructs a new LogRecord.
                     * @memberof opentelemetry.proto.logs.v1
                     * @classdesc Represents a LogRecord.
                     * @constructor
                     * @param {opentelemetry.proto.logs.v1.LogRecord.$Properties=} [properties] Properties to set
                     * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                     */
                    const LogRecord = function (properties) {
                        this.attributes = [];
                        if (properties)
                            for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                    this[keys[i]] = properties[keys[i]];
                    };

                    /**
                     * LogRecord timeUnixNano.
                     * @member {number|Long} timeUnixNano
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.timeUnixNano = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                    /**
                     * LogRecord observedTimeUnixNano.
                     * @member {number|Long} observedTimeUnixNano
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.observedTimeUnixNano = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                    /**
                     * LogRecord severityNumber.
                     * @member {opentelemetry.proto.logs.v1.SeverityNumber} severityNumber
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.severityNumber = 0;

                    /**
                     * LogRecord severityText.
                     * @member {string} severityText
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.severityText = "";

                    /**
                     * LogRecord body.
                     * @member {opentelemetry.proto.common.v1.AnyValue.$Properties|null|undefined} body
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.body = null;

                    /**
                     * LogRecord attributes.
                     * @member {Array.<opentelemetry.proto.common.v1.KeyValue.$Properties>} attributes
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.attributes = $util.emptyArray;

                    /**
                     * LogRecord droppedAttributesCount.
                     * @member {number} droppedAttributesCount
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.droppedAttributesCount = 0;

                    /**
                     * LogRecord flags.
                     * @member {number} flags
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.flags = 0;

                    /**
                     * LogRecord traceId.
                     * @member {Uint8Array} traceId
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.traceId = $util.newBuffer([]);

                    /**
                     * LogRecord spanId.
                     * @member {Uint8Array} spanId
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.spanId = $util.newBuffer([]);

                    /**
                     * LogRecord eventName.
                     * @member {string} eventName
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     */
                    LogRecord.prototype.eventName = "";

                    /**
                     * Creates a new LogRecord instance using the specified properties.
                     * @function create
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogRecord.$Properties=} [properties] Properties to set
                     * @returns {opentelemetry.proto.logs.v1.LogRecord} LogRecord instance
                     * @type {{
                     *   (properties: opentelemetry.proto.logs.v1.LogRecord.$Shape): opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape;
                     *   (properties?: opentelemetry.proto.logs.v1.LogRecord.$Properties): opentelemetry.proto.logs.v1.LogRecord;
                     * }}
                     */
                    LogRecord.create = function(properties) {
                        return new LogRecord(properties);
                    };

                    /**
                     * Encodes the specified LogRecord message. Does not implicitly {@link opentelemetry.proto.logs.v1.LogRecord.verify|verify} messages.
                     * @function encode
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogRecord.$Properties} message LogRecord message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    LogRecord.encode = function (message, writer, _depth) {
                        if (!writer)
                            writer = $Writer.create();
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        if (message.timeUnixNano != null && $Object.hasOwnProperty.call(message, "timeUnixNano") && (typeof message.timeUnixNano === "object" ? message.timeUnixNano.low || message.timeUnixNano.high : message.timeUnixNano !== 0))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.timeUnixNano);
                        if (message.severityNumber != null && $Object.hasOwnProperty.call(message, "severityNumber") && message.severityNumber !== 0)
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.severityNumber);
                        if (message.severityText != null && $Object.hasOwnProperty.call(message, "severityText") && message.severityText !== "")
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.severityText);
                        if (message.body != null && $Object.hasOwnProperty.call(message, "body"))
                            $root.opentelemetry.proto.common.v1.AnyValue.encode(message.body, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                        if (message.attributes != null && message.attributes.length)
                            for (let i = 0; i < message.attributes.length; ++i)
                                $root.opentelemetry.proto.common.v1.KeyValue.encode(message.attributes[i], writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount") && message.droppedAttributesCount !== 0)
                            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.droppedAttributesCount);
                        if (message.flags != null && $Object.hasOwnProperty.call(message, "flags") && message.flags !== 0)
                            writer.uint32(/* id 8, wireType 5 =*/69).fixed32(message.flags);
                        if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId") && message.traceId.length)
                            writer.uint32(/* id 9, wireType 2 =*/74).bytes(message.traceId);
                        if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId") && message.spanId.length)
                            writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.spanId);
                        if (message.observedTimeUnixNano != null && $Object.hasOwnProperty.call(message, "observedTimeUnixNano") && (typeof message.observedTimeUnixNano === "object" ? message.observedTimeUnixNano.low || message.observedTimeUnixNano.high : message.observedTimeUnixNano !== 0))
                            writer.uint32(/* id 11, wireType 1 =*/89).fixed64(message.observedTimeUnixNano);
                        if (message.eventName != null && $Object.hasOwnProperty.call(message, "eventName") && message.eventName !== "")
                            writer.uint32(/* id 12, wireType 2 =*/98).string(message.eventName);
                        if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                            for (let i = 0; i < message.$unknowns.length; ++i)
                                writer.raw(message.$unknowns[i]);
                        return writer;
                    };

                    /**
                     * Encodes the specified LogRecord message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.LogRecord.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogRecord.$Properties} message LogRecord message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    LogRecord.encodeDelimited = function(message, writer) {
                        return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
                    };

                    /**
                     * Decodes a LogRecord message from the specified reader or buffer.
                     * @function decode
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape} LogRecord
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    LogRecord.decode = function (reader, length, _end, _depth, _target) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $Reader.recursionLimit)
                            throw $Error("max depth exceeded");
                        let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.opentelemetry.proto.logs.v1.LogRecord(), value;
                        while (reader.pos < end) {
                            let start = reader.pos;
                            let tag = reader.tag();
                            if (tag === _end) {
                                _end = $undefined;
                                break;
                            }
                            let wireType = tag & 7;
                            switch (tag >>>= 3) {
                            case 1: {
                                    if (wireType !== 1)
                                        break;
                                    if (typeof (value = reader.fixed64()) === "object" ? value.low || value.high : value !== 0)
                                        message.timeUnixNano = value;
                                    else
                                        delete message.timeUnixNano;
                                    continue;
                                }
                            case 11: {
                                    if (wireType !== 1)
                                        break;
                                    if (typeof (value = reader.fixed64()) === "object" ? value.low || value.high : value !== 0)
                                        message.observedTimeUnixNano = value;
                                    else
                                        delete message.observedTimeUnixNano;
                                    continue;
                                }
                            case 2: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.int32())
                                        message.severityNumber = value;
                                    else
                                        delete message.severityNumber;
                                    continue;
                                }
                            case 3: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.severityText = value;
                                    else
                                        delete message.severityText;
                                    continue;
                                }
                            case 5: {
                                    if (wireType !== 2)
                                        break;
                                    message.body = $root.opentelemetry.proto.common.v1.AnyValue.decode(reader, reader.uint32(), $undefined, _depth + 1, message.body);
                                    continue;
                                }
                            case 6: {
                                    if (wireType !== 2)
                                        break;
                                    if (!(message.attributes && message.attributes.length))
                                        message.attributes = [];
                                    message.attributes.push($root.opentelemetry.proto.common.v1.KeyValue.decode(reader, reader.uint32(), $undefined, _depth + 1));
                                    continue;
                                }
                            case 7: {
                                    if (wireType !== 0)
                                        break;
                                    if (value = reader.uint32())
                                        message.droppedAttributesCount = value;
                                    else
                                        delete message.droppedAttributesCount;
                                    continue;
                                }
                            case 8: {
                                    if (wireType !== 5)
                                        break;
                                    if (value = reader.fixed32())
                                        message.flags = value;
                                    else
                                        delete message.flags;
                                    continue;
                                }
                            case 9: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.bytes()).length)
                                        message.traceId = value;
                                    else
                                        delete message.traceId;
                                    continue;
                                }
                            case 10: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.bytes()).length)
                                        message.spanId = value;
                                    else
                                        delete message.spanId;
                                    continue;
                                }
                            case 12: {
                                    if (wireType !== 2)
                                        break;
                                    if ((value = reader.stringVerify()).length)
                                        message.eventName = value;
                                    else
                                        delete message.eventName;
                                    continue;
                                }
                            }
                            reader.skipType(wireType, _depth, tag);
                            if (!reader.discardUnknown) {
                                $util.makeProp(message, "$unknowns", false);
                                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                            }
                        }
                        if (_end !== $undefined)
                            throw $Error("missing end group");
                        return message;
                    };

                    /**
                     * Decodes a LogRecord message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape} LogRecord
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    LogRecord.decodeDelimited = function(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a LogRecord message.
                     * @function verify
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    LogRecord.verify = function (message, _depth) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            return "max depth exceeded";
                        if (message.timeUnixNano != null && $Object.hasOwnProperty.call(message, "timeUnixNano"))
                            if (!$util.isInteger(message.timeUnixNano) && !(message.timeUnixNano && $util.isInteger(message.timeUnixNano.low) && $util.isInteger(message.timeUnixNano.high)))
                                return "timeUnixNano: integer|Long expected";
                        if (message.observedTimeUnixNano != null && $Object.hasOwnProperty.call(message, "observedTimeUnixNano"))
                            if (!$util.isInteger(message.observedTimeUnixNano) && !(message.observedTimeUnixNano && $util.isInteger(message.observedTimeUnixNano.low) && $util.isInteger(message.observedTimeUnixNano.high)))
                                return "observedTimeUnixNano: integer|Long expected";
                        if (message.severityNumber != null && $Object.hasOwnProperty.call(message, "severityNumber"))
                            if (typeof message.severityNumber !== "number" || (message.severityNumber | 0) !== message.severityNumber)
                                return "severityNumber: enum value expected";
                        if (message.severityText != null && $Object.hasOwnProperty.call(message, "severityText"))
                            if (!$util.isString(message.severityText))
                                return "severityText: string expected";
                        if (message.body != null && $Object.hasOwnProperty.call(message, "body")) {
                            let error = $root.opentelemetry.proto.common.v1.AnyValue.verify(message.body, _depth + 1);
                            if (error)
                                return "body." + error;
                        }
                        if (message.attributes != null && $Object.hasOwnProperty.call(message, "attributes")) {
                            if (!$Array.isArray(message.attributes))
                                return "attributes: array expected";
                            for (let i = 0; i < message.attributes.length; ++i) {
                                let error = $root.opentelemetry.proto.common.v1.KeyValue.verify(message.attributes[i], _depth + 1);
                                if (error)
                                    return "attributes." + error;
                            }
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            if (!$util.isInteger(message.droppedAttributesCount))
                                return "droppedAttributesCount: integer expected";
                        if (message.flags != null && $Object.hasOwnProperty.call(message, "flags"))
                            if (!$util.isInteger(message.flags))
                                return "flags: integer expected";
                        if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId"))
                            if (!(message.traceId && typeof message.traceId.length === "number" || $util.isString(message.traceId)))
                                return "traceId: buffer expected";
                        if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId"))
                            if (!(message.spanId && typeof message.spanId.length === "number" || $util.isString(message.spanId)))
                                return "spanId: buffer expected";
                        if (message.eventName != null && $Object.hasOwnProperty.call(message, "eventName"))
                            if (!$util.isString(message.eventName))
                                return "eventName: string expected";
                        return null;
                    };

                    /**
                     * Creates a LogRecord message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {opentelemetry.proto.logs.v1.LogRecord} LogRecord
                     */
                    LogRecord.fromObject = function (object, _depth) {
                        if (object instanceof $root.opentelemetry.proto.logs.v1.LogRecord)
                            return object;
                        if (!$util.isObject(object))
                            throw $TypeError(".opentelemetry.proto.logs.v1.LogRecord: object expected");
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let message = new $root.opentelemetry.proto.logs.v1.LogRecord();
                        if (object.timeUnixNano != null)
                            if (typeof object.timeUnixNano === "object" ? object.timeUnixNano.low || object.timeUnixNano.high : $Number(object.timeUnixNano) !== 0)
                                if ($util.Long)
                                    message.timeUnixNano = $util.Long.fromValue(object.timeUnixNano, true);
                                else if (typeof object.timeUnixNano === "string")
                                    message.timeUnixNano = $parseInt(object.timeUnixNano, 10);
                                else if (typeof object.timeUnixNano === "number")
                                    message.timeUnixNano = object.timeUnixNano;
                                else if (typeof object.timeUnixNano === "object")
                                    message.timeUnixNano = new $util.LongBits(object.timeUnixNano.low >>> 0, object.timeUnixNano.high >>> 0).toNumber(true);
                        if (object.observedTimeUnixNano != null)
                            if (typeof object.observedTimeUnixNano === "object" ? object.observedTimeUnixNano.low || object.observedTimeUnixNano.high : $Number(object.observedTimeUnixNano) !== 0)
                                if ($util.Long)
                                    message.observedTimeUnixNano = $util.Long.fromValue(object.observedTimeUnixNano, true);
                                else if (typeof object.observedTimeUnixNano === "string")
                                    message.observedTimeUnixNano = $parseInt(object.observedTimeUnixNano, 10);
                                else if (typeof object.observedTimeUnixNano === "number")
                                    message.observedTimeUnixNano = object.observedTimeUnixNano;
                                else if (typeof object.observedTimeUnixNano === "object")
                                    message.observedTimeUnixNano = new $util.LongBits(object.observedTimeUnixNano.low >>> 0, object.observedTimeUnixNano.high >>> 0).toNumber(true);
                        if (object.severityNumber !== 0 && (typeof object.severityNumber !== "string" || $root.opentelemetry.proto.logs.v1.SeverityNumber[object.severityNumber] !== 0))
                            switch (object.severityNumber) {
                            case "SEVERITY_NUMBER_UNSPECIFIED":
                            case 0:
                                message.severityNumber = 0;
                                break;
                            case "SEVERITY_NUMBER_TRACE":
                            case 1:
                                message.severityNumber = 1;
                                break;
                            case "SEVERITY_NUMBER_TRACE2":
                            case 2:
                                message.severityNumber = 2;
                                break;
                            case "SEVERITY_NUMBER_TRACE3":
                            case 3:
                                message.severityNumber = 3;
                                break;
                            case "SEVERITY_NUMBER_TRACE4":
                            case 4:
                                message.severityNumber = 4;
                                break;
                            case "SEVERITY_NUMBER_DEBUG":
                            case 5:
                                message.severityNumber = 5;
                                break;
                            case "SEVERITY_NUMBER_DEBUG2":
                            case 6:
                                message.severityNumber = 6;
                                break;
                            case "SEVERITY_NUMBER_DEBUG3":
                            case 7:
                                message.severityNumber = 7;
                                break;
                            case "SEVERITY_NUMBER_DEBUG4":
                            case 8:
                                message.severityNumber = 8;
                                break;
                            case "SEVERITY_NUMBER_INFO":
                            case 9:
                                message.severityNumber = 9;
                                break;
                            case "SEVERITY_NUMBER_INFO2":
                            case 10:
                                message.severityNumber = 10;
                                break;
                            case "SEVERITY_NUMBER_INFO3":
                            case 11:
                                message.severityNumber = 11;
                                break;
                            case "SEVERITY_NUMBER_INFO4":
                            case 12:
                                message.severityNumber = 12;
                                break;
                            case "SEVERITY_NUMBER_WARN":
                            case 13:
                                message.severityNumber = 13;
                                break;
                            case "SEVERITY_NUMBER_WARN2":
                            case 14:
                                message.severityNumber = 14;
                                break;
                            case "SEVERITY_NUMBER_WARN3":
                            case 15:
                                message.severityNumber = 15;
                                break;
                            case "SEVERITY_NUMBER_WARN4":
                            case 16:
                                message.severityNumber = 16;
                                break;
                            case "SEVERITY_NUMBER_ERROR":
                            case 17:
                                message.severityNumber = 17;
                                break;
                            case "SEVERITY_NUMBER_ERROR2":
                            case 18:
                                message.severityNumber = 18;
                                break;
                            case "SEVERITY_NUMBER_ERROR3":
                            case 19:
                                message.severityNumber = 19;
                                break;
                            case "SEVERITY_NUMBER_ERROR4":
                            case 20:
                                message.severityNumber = 20;
                                break;
                            case "SEVERITY_NUMBER_FATAL":
                            case 21:
                                message.severityNumber = 21;
                                break;
                            case "SEVERITY_NUMBER_FATAL2":
                            case 22:
                                message.severityNumber = 22;
                                break;
                            case "SEVERITY_NUMBER_FATAL3":
                            case 23:
                                message.severityNumber = 23;
                                break;
                            case "SEVERITY_NUMBER_FATAL4":
                            case 24:
                                message.severityNumber = 24;
                                break;
                            default:
                                if (typeof object.severityNumber === "number" && (object.severityNumber | 0) === object.severityNumber)
                                    message.severityNumber = object.severityNumber;
                            }
                        if (object.severityText != null)
                            if (typeof object.severityText !== "string" || object.severityText.length)
                                message.severityText = $String(object.severityText);
                        if (object.body != null) {
                            if (!$util.isObject(object.body))
                                throw $TypeError(".opentelemetry.proto.logs.v1.LogRecord.body: object expected");
                            message.body = $root.opentelemetry.proto.common.v1.AnyValue.fromObject(object.body, _depth + 1);
                        }
                        if (object.attributes) {
                            if (!$Array.isArray(object.attributes))
                                throw $TypeError(".opentelemetry.proto.logs.v1.LogRecord.attributes: array expected");
                            message.attributes = $Array(object.attributes.length);
                            for (let i = 0; i < object.attributes.length; ++i) {
                                if (!$util.isObject(object.attributes[i]))
                                    throw $TypeError(".opentelemetry.proto.logs.v1.LogRecord.attributes: object expected");
                                message.attributes[i] = $root.opentelemetry.proto.common.v1.KeyValue.fromObject(object.attributes[i], _depth + 1);
                            }
                        }
                        if (object.droppedAttributesCount != null)
                            if ($Number(object.droppedAttributesCount) !== 0)
                                message.droppedAttributesCount = object.droppedAttributesCount >>> 0;
                        if (object.flags != null)
                            if ($Number(object.flags) !== 0)
                                message.flags = object.flags >>> 0;
                        if (object.traceId != null)
                            if (object.traceId.length)
                                if (typeof object.traceId === "string")
                                    $util.base64.decode(object.traceId, message.traceId = $util.newBuffer($util.base64.length(object.traceId)), 0);
                                else if (object.traceId.length >= 0)
                                    message.traceId = object.traceId;
                        if (object.spanId != null)
                            if (object.spanId.length)
                                if (typeof object.spanId === "string")
                                    $util.base64.decode(object.spanId, message.spanId = $util.newBuffer($util.base64.length(object.spanId)), 0);
                                else if (object.spanId.length >= 0)
                                    message.spanId = object.spanId;
                        if (object.eventName != null)
                            if (typeof object.eventName !== "string" || object.eventName.length)
                                message.eventName = $String(object.eventName);
                        return message;
                    };

                    /**
                     * Creates a plain object from a LogRecord message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {opentelemetry.proto.logs.v1.LogRecord} message LogRecord
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    LogRecord.toObject = function (message, options, _depth) {
                        if (!options)
                            options = {};
                        if (_depth === $undefined)
                            _depth = 0;
                        if (_depth > $util.recursionLimit)
                            throw $Error("max depth exceeded");
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.attributes = [];
                        if (options.defaults) {
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, true);
                                object.timeUnixNano = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                            } else
                                object.timeUnixNano = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                            object.severityNumber = options.enums === $String ? "SEVERITY_NUMBER_UNSPECIFIED" : 0;
                            object.severityText = "";
                            object.body = null;
                            object.droppedAttributesCount = 0;
                            object.flags = 0;
                            if (options.bytes === $String)
                                object.traceId = "";
                            else {
                                object.traceId = [];
                                if (options.bytes !== $Array)
                                    object.traceId = $util.newBuffer(object.traceId);
                            }
                            if (options.bytes === $String)
                                object.spanId = "";
                            else {
                                object.spanId = [];
                                if (options.bytes !== $Array)
                                    object.spanId = $util.newBuffer(object.spanId);
                            }
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, true);
                                object.observedTimeUnixNano = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                            } else
                                object.observedTimeUnixNano = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                            object.eventName = "";
                        }
                        if (message.timeUnixNano != null && $Object.hasOwnProperty.call(message, "timeUnixNano"))
                            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                object.timeUnixNano = typeof message.timeUnixNano === "number" ? $BigInt(message.timeUnixNano) : $util.Long.fromBits(message.timeUnixNano.low >>> 0, message.timeUnixNano.high >>> 0, true).toBigInt();
                            else if (typeof message.timeUnixNano === "number")
                                object.timeUnixNano = options.longs === $String ? $String(message.timeUnixNano) : message.timeUnixNano;
                            else
                                object.timeUnixNano = options.longs === $String ? $util.Long.prototype.toString.call(message.timeUnixNano) : options.longs === $Number ? new $util.LongBits(message.timeUnixNano.low >>> 0, message.timeUnixNano.high >>> 0).toNumber(true) : message.timeUnixNano;
                        if (message.severityNumber != null && $Object.hasOwnProperty.call(message, "severityNumber"))
                            object.severityNumber = options.enums === $String ? $root.opentelemetry.proto.logs.v1.SeverityNumber[message.severityNumber] === $undefined ? message.severityNumber : $root.opentelemetry.proto.logs.v1.SeverityNumber[message.severityNumber] : message.severityNumber;
                        if (message.severityText != null && $Object.hasOwnProperty.call(message, "severityText"))
                            object.severityText = message.severityText;
                        if (message.body != null && $Object.hasOwnProperty.call(message, "body"))
                            object.body = $root.opentelemetry.proto.common.v1.AnyValue.toObject(message.body, options, _depth + 1);
                        if (message.attributes && message.attributes.length) {
                            object.attributes = $Array(message.attributes.length);
                            for (let j = 0; j < message.attributes.length; ++j)
                                object.attributes[j] = $root.opentelemetry.proto.common.v1.KeyValue.toObject(message.attributes[j], options, _depth + 1);
                        }
                        if (message.droppedAttributesCount != null && $Object.hasOwnProperty.call(message, "droppedAttributesCount"))
                            object.droppedAttributesCount = message.droppedAttributesCount;
                        if (message.flags != null && $Object.hasOwnProperty.call(message, "flags"))
                            object.flags = message.flags;
                        if (message.traceId != null && $Object.hasOwnProperty.call(message, "traceId"))
                            object.traceId = options.bytes === $String ? $util.base64.encode(message.traceId, 0, message.traceId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.traceId) : message.traceId;
                        if (message.spanId != null && $Object.hasOwnProperty.call(message, "spanId"))
                            object.spanId = options.bytes === $String ? $util.base64.encode(message.spanId, 0, message.spanId.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.spanId) : message.spanId;
                        if (message.observedTimeUnixNano != null && $Object.hasOwnProperty.call(message, "observedTimeUnixNano"))
                            if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                                object.observedTimeUnixNano = typeof message.observedTimeUnixNano === "number" ? $BigInt(message.observedTimeUnixNano) : $util.Long.fromBits(message.observedTimeUnixNano.low >>> 0, message.observedTimeUnixNano.high >>> 0, true).toBigInt();
                            else if (typeof message.observedTimeUnixNano === "number")
                                object.observedTimeUnixNano = options.longs === $String ? $String(message.observedTimeUnixNano) : message.observedTimeUnixNano;
                            else
                                object.observedTimeUnixNano = options.longs === $String ? $util.Long.prototype.toString.call(message.observedTimeUnixNano) : options.longs === $Number ? new $util.LongBits(message.observedTimeUnixNano.low >>> 0, message.observedTimeUnixNano.high >>> 0).toNumber(true) : message.observedTimeUnixNano;
                        if (message.eventName != null && $Object.hasOwnProperty.call(message, "eventName"))
                            object.eventName = message.eventName;
                        return object;
                    };

                    /**
                     * Converts this LogRecord to JSON.
                     * @function toJSON
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    LogRecord.prototype.toJSON = function() {
                        return LogRecord.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the type url for LogRecord
                     * @function getTypeUrl
                     * @memberof opentelemetry.proto.logs.v1.LogRecord
                     * @static
                     * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns {string} The type url
                     */
                    LogRecord.getTypeUrl = function(prefix) {
                        if (prefix === $undefined)
                            prefix = "type.googleapis.com";
                        return prefix + "/opentelemetry.proto.logs.v1.LogRecord";
                    };

                    return LogRecord;
                })();

                return v1;
            })();

            return logs;
        })();

        return proto;
    })();

    return opentelemetry;
})();

export {
  $root as default
};
