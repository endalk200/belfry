import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace opentelemetry. */
export namespace opentelemetry {

    /** Namespace proto. */
    namespace proto {

        /** Namespace collector. */
        namespace collector {

            /** Namespace trace. */
            namespace trace {

                /** Namespace v1. */
                namespace v1 {

                    /** Represents a TraceService */
                    class TraceService extends $protobuf.rpc.Service {

                        /**
                         * Constructs a new TraceService service.
                         * @param rpcImpl RPC implementation
                         * @param [requestDelimited=false] Whether requests are length-delimited
                         * @param [responseDelimited=false] Whether responses are length-delimited
                         */
                        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                        /**
                         * Creates new TraceService service using the specified rpc implementation.
                         * @param rpcImpl RPC implementation
                         * @param [requestDelimited=false] Whether requests are length-delimited
                         * @param [responseDelimited=false] Whether responses are length-delimited
                         * @returns RPC service. Useful where requests and/or responses are streamed.
                         */
                        static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): TraceService;

                        /** Calls Export. */
                        export: opentelemetry.proto.collector.trace.v1.TraceService.Export;
                    }

                    namespace TraceService {

                        /**
                         * Callback as used by {@link opentelemetry.proto.collector.trace.v1.TraceService#export_}.
                         * @param error Error, if any
                         * @param [response] ExportTraceServiceResponse
                         */
                        type ExportCallback = (error: (Error|null), response?: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse) => void;

                        /** Calls Export. */
                        type Export = {
                          (request: opentelemetry.proto.collector.trace.v1.IExportTraceServiceRequest, callback: opentelemetry.proto.collector.trace.v1.TraceService.ExportCallback): void;
                          (request: opentelemetry.proto.collector.trace.v1.IExportTraceServiceRequest): Promise<opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse>;
                          readonly name: "Export";
                          readonly path: "/opentelemetry.proto.collector.trace.v1.TraceService/Export";
                          readonly requestType: "ExportTraceServiceRequest";
                          readonly responseType: "ExportTraceServiceResponse";
                          readonly requestStream: undefined;
                          readonly responseStream: undefined;
                        };
                    }

                    /**
                     * Properties of an ExportTraceServiceRequest.
                     * @deprecated Use opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties instead.
                     */
                    interface IExportTraceServiceRequest extends opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties {
                    }

                    /** Represents an ExportTraceServiceRequest. */
                    class ExportTraceServiceRequest {

                        /**
                         * Constructs a new ExportTraceServiceRequest.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** ExportTraceServiceRequest resourceSpans. */
                        resourceSpans: opentelemetry.proto.trace.v1.ResourceSpans.$Properties[];

                        /**
                         * Creates a new ExportTraceServiceRequest instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ExportTraceServiceRequest instance
                         */
                        static create(properties: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape;
                        static create(properties?: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest;

                        /**
                         * Encodes the specified ExportTraceServiceRequest message. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.verify|verify} messages.
                         * @param message ExportTraceServiceRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ExportTraceServiceRequest message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.verify|verify} messages.
                         * @param message ExportTraceServiceRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an ExportTraceServiceRequest message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape} ExportTraceServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape;

                        /**
                         * Decodes an ExportTraceServiceRequest message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape} ExportTraceServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest & opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.$Shape;

                        /**
                         * Verifies an ExportTraceServiceRequest message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an ExportTraceServiceRequest message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ExportTraceServiceRequest
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest;

                        /**
                         * Creates a plain object from an ExportTraceServiceRequest message. Also converts values to other types if specified.
                         * @param message ExportTraceServiceRequest
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ExportTraceServiceRequest to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for ExportTraceServiceRequest
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace ExportTraceServiceRequest {

                        /** Properties of an ExportTraceServiceRequest. */
                        interface $Properties {

                            /** ExportTraceServiceRequest resourceSpans */
                            resourceSpans?: (opentelemetry.proto.trace.v1.ResourceSpans.$Properties[]|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an ExportTraceServiceRequest. */
                        type $Shape = {
                          resourceSpans?: opentelemetry.proto.trace.v1.ResourceSpans.$Shape[]|null;
                          $unknowns?: Uint8Array[];
                        };
                    }

                    /**
                     * Properties of an ExportTraceServiceResponse.
                     * @deprecated Use opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties instead.
                     */
                    interface IExportTraceServiceResponse extends opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties {
                    }

                    /** Represents an ExportTraceServiceResponse. */
                    class ExportTraceServiceResponse {

                        /**
                         * Constructs a new ExportTraceServiceResponse.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** ExportTraceServiceResponse partialSuccess. */
                        partialSuccess?: (opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties|null);

                        /**
                         * Creates a new ExportTraceServiceResponse instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ExportTraceServiceResponse instance
                         */
                        static create(properties: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape): opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape;
                        static create(properties?: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties): opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse;

                        /**
                         * Encodes the specified ExportTraceServiceResponse message. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.verify|verify} messages.
                         * @param message ExportTraceServiceResponse message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ExportTraceServiceResponse message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.verify|verify} messages.
                         * @param message ExportTraceServiceResponse message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an ExportTraceServiceResponse message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape} ExportTraceServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape;

                        /**
                         * Decodes an ExportTraceServiceResponse message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape} ExportTraceServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse & opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Shape;

                        /**
                         * Verifies an ExportTraceServiceResponse message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an ExportTraceServiceResponse message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ExportTraceServiceResponse
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse;

                        /**
                         * Creates a plain object from an ExportTraceServiceResponse message. Also converts values to other types if specified.
                         * @param message ExportTraceServiceResponse
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ExportTraceServiceResponse to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for ExportTraceServiceResponse
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace ExportTraceServiceResponse {

                        /** Properties of an ExportTraceServiceResponse. */
                        interface $Properties {

                            /** ExportTraceServiceResponse partialSuccess */
                            partialSuccess?: (opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an ExportTraceServiceResponse. */
                        type $Shape = opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.$Properties;
                    }

                    /**
                     * Properties of an ExportTracePartialSuccess.
                     * @deprecated Use opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties instead.
                     */
                    interface IExportTracePartialSuccess extends opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties {
                    }

                    /** Represents an ExportTracePartialSuccess. */
                    class ExportTracePartialSuccess {

                        /**
                         * Constructs a new ExportTracePartialSuccess.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** ExportTracePartialSuccess rejectedSpans. */
                        rejectedSpans: (number|Long);

                        /** ExportTracePartialSuccess errorMessage. */
                        errorMessage: string;

                        /**
                         * Creates a new ExportTracePartialSuccess instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ExportTracePartialSuccess instance
                         */
                        static create(properties: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape): opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape;
                        static create(properties?: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties): opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess;

                        /**
                         * Encodes the specified ExportTracePartialSuccess message. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.verify|verify} messages.
                         * @param message ExportTracePartialSuccess message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ExportTracePartialSuccess message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.verify|verify} messages.
                         * @param message ExportTracePartialSuccess message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an ExportTracePartialSuccess message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape} ExportTracePartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape;

                        /**
                         * Decodes an ExportTracePartialSuccess message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape} ExportTracePartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess & opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Shape;

                        /**
                         * Verifies an ExportTracePartialSuccess message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an ExportTracePartialSuccess message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ExportTracePartialSuccess
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess;

                        /**
                         * Creates a plain object from an ExportTracePartialSuccess message. Also converts values to other types if specified.
                         * @param message ExportTracePartialSuccess
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ExportTracePartialSuccess to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for ExportTracePartialSuccess
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace ExportTracePartialSuccess {

                        /** Properties of an ExportTracePartialSuccess. */
                        interface $Properties {

                            /** ExportTracePartialSuccess rejectedSpans */
                            rejectedSpans?: (number|Long|null);

                            /** ExportTracePartialSuccess errorMessage */
                            errorMessage?: (string|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an ExportTracePartialSuccess. */
                        type $Shape = opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.$Properties;
                    }
                }
            }

            /** Namespace logs. */
            namespace logs {

                /** Namespace v1. */
                namespace v1 {

                    /** Represents a LogsService */
                    class LogsService extends $protobuf.rpc.Service {

                        /**
                         * Constructs a new LogsService service.
                         * @param rpcImpl RPC implementation
                         * @param [requestDelimited=false] Whether requests are length-delimited
                         * @param [responseDelimited=false] Whether responses are length-delimited
                         */
                        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                        /**
                         * Creates new LogsService service using the specified rpc implementation.
                         * @param rpcImpl RPC implementation
                         * @param [requestDelimited=false] Whether requests are length-delimited
                         * @param [responseDelimited=false] Whether responses are length-delimited
                         * @returns RPC service. Useful where requests and/or responses are streamed.
                         */
                        static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): LogsService;

                        /** Calls Export. */
                        export: opentelemetry.proto.collector.logs.v1.LogsService.Export;
                    }

                    namespace LogsService {

                        /**
                         * Callback as used by {@link opentelemetry.proto.collector.logs.v1.LogsService#export_}.
                         * @param error Error, if any
                         * @param [response] ExportLogsServiceResponse
                         */
                        type ExportCallback = (error: (Error|null), response?: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse) => void;

                        /** Calls Export. */
                        type Export = {
                          (request: opentelemetry.proto.collector.logs.v1.IExportLogsServiceRequest, callback: opentelemetry.proto.collector.logs.v1.LogsService.ExportCallback): void;
                          (request: opentelemetry.proto.collector.logs.v1.IExportLogsServiceRequest): Promise<opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse>;
                          readonly name: "Export";
                          readonly path: "/opentelemetry.proto.collector.logs.v1.LogsService/Export";
                          readonly requestType: "ExportLogsServiceRequest";
                          readonly responseType: "ExportLogsServiceResponse";
                          readonly requestStream: undefined;
                          readonly responseStream: undefined;
                        };
                    }

                    /**
                     * Properties of an ExportLogsServiceRequest.
                     * @deprecated Use opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties instead.
                     */
                    interface IExportLogsServiceRequest extends opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties {
                    }

                    /** Represents an ExportLogsServiceRequest. */
                    class ExportLogsServiceRequest {

                        /**
                         * Constructs a new ExportLogsServiceRequest.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** ExportLogsServiceRequest resourceLogs. */
                        resourceLogs: opentelemetry.proto.logs.v1.ResourceLogs.$Properties[];

                        /**
                         * Creates a new ExportLogsServiceRequest instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ExportLogsServiceRequest instance
                         */
                        static create(properties: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape): opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape;
                        static create(properties?: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties): opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest;

                        /**
                         * Encodes the specified ExportLogsServiceRequest message. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.verify|verify} messages.
                         * @param message ExportLogsServiceRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ExportLogsServiceRequest message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.verify|verify} messages.
                         * @param message ExportLogsServiceRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an ExportLogsServiceRequest message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape} ExportLogsServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape;

                        /**
                         * Decodes an ExportLogsServiceRequest message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape} ExportLogsServiceRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest & opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.$Shape;

                        /**
                         * Verifies an ExportLogsServiceRequest message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an ExportLogsServiceRequest message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ExportLogsServiceRequest
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest;

                        /**
                         * Creates a plain object from an ExportLogsServiceRequest message. Also converts values to other types if specified.
                         * @param message ExportLogsServiceRequest
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ExportLogsServiceRequest to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for ExportLogsServiceRequest
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace ExportLogsServiceRequest {

                        /** Properties of an ExportLogsServiceRequest. */
                        interface $Properties {

                            /** ExportLogsServiceRequest resourceLogs */
                            resourceLogs?: (opentelemetry.proto.logs.v1.ResourceLogs.$Properties[]|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an ExportLogsServiceRequest. */
                        type $Shape = {
                          resourceLogs?: opentelemetry.proto.logs.v1.ResourceLogs.$Shape[]|null;
                          $unknowns?: Uint8Array[];
                        };
                    }

                    /**
                     * Properties of an ExportLogsServiceResponse.
                     * @deprecated Use opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties instead.
                     */
                    interface IExportLogsServiceResponse extends opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties {
                    }

                    /** Represents an ExportLogsServiceResponse. */
                    class ExportLogsServiceResponse {

                        /**
                         * Constructs a new ExportLogsServiceResponse.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** ExportLogsServiceResponse partialSuccess. */
                        partialSuccess?: (opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties|null);

                        /**
                         * Creates a new ExportLogsServiceResponse instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ExportLogsServiceResponse instance
                         */
                        static create(properties: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape): opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape;
                        static create(properties?: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties): opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse;

                        /**
                         * Encodes the specified ExportLogsServiceResponse message. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.verify|verify} messages.
                         * @param message ExportLogsServiceResponse message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ExportLogsServiceResponse message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.verify|verify} messages.
                         * @param message ExportLogsServiceResponse message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an ExportLogsServiceResponse message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape} ExportLogsServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape;

                        /**
                         * Decodes an ExportLogsServiceResponse message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape} ExportLogsServiceResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse & opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Shape;

                        /**
                         * Verifies an ExportLogsServiceResponse message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an ExportLogsServiceResponse message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ExportLogsServiceResponse
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse;

                        /**
                         * Creates a plain object from an ExportLogsServiceResponse message. Also converts values to other types if specified.
                         * @param message ExportLogsServiceResponse
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ExportLogsServiceResponse to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for ExportLogsServiceResponse
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace ExportLogsServiceResponse {

                        /** Properties of an ExportLogsServiceResponse. */
                        interface $Properties {

                            /** ExportLogsServiceResponse partialSuccess */
                            partialSuccess?: (opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an ExportLogsServiceResponse. */
                        type $Shape = opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.$Properties;
                    }

                    /**
                     * Properties of an ExportLogsPartialSuccess.
                     * @deprecated Use opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties instead.
                     */
                    interface IExportLogsPartialSuccess extends opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties {
                    }

                    /** Represents an ExportLogsPartialSuccess. */
                    class ExportLogsPartialSuccess {

                        /**
                         * Constructs a new ExportLogsPartialSuccess.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** ExportLogsPartialSuccess rejectedLogRecords. */
                        rejectedLogRecords: (number|Long);

                        /** ExportLogsPartialSuccess errorMessage. */
                        errorMessage: string;

                        /**
                         * Creates a new ExportLogsPartialSuccess instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ExportLogsPartialSuccess instance
                         */
                        static create(properties: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape): opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape;
                        static create(properties?: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties): opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess;

                        /**
                         * Encodes the specified ExportLogsPartialSuccess message. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.verify|verify} messages.
                         * @param message ExportLogsPartialSuccess message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ExportLogsPartialSuccess message, length delimited. Does not implicitly {@link opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.verify|verify} messages.
                         * @param message ExportLogsPartialSuccess message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an ExportLogsPartialSuccess message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape} ExportLogsPartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape;

                        /**
                         * Decodes an ExportLogsPartialSuccess message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape} ExportLogsPartialSuccess
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess & opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Shape;

                        /**
                         * Verifies an ExportLogsPartialSuccess message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an ExportLogsPartialSuccess message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ExportLogsPartialSuccess
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess;

                        /**
                         * Creates a plain object from an ExportLogsPartialSuccess message. Also converts values to other types if specified.
                         * @param message ExportLogsPartialSuccess
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ExportLogsPartialSuccess to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for ExportLogsPartialSuccess
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace ExportLogsPartialSuccess {

                        /** Properties of an ExportLogsPartialSuccess. */
                        interface $Properties {

                            /** ExportLogsPartialSuccess rejectedLogRecords */
                            rejectedLogRecords?: (number|Long|null);

                            /** ExportLogsPartialSuccess errorMessage */
                            errorMessage?: (string|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an ExportLogsPartialSuccess. */
                        type $Shape = opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.$Properties;
                    }
                }
            }
        }

        /** Namespace trace. */
        namespace trace {

            /** Namespace v1. */
            namespace v1 {

                /**
                 * Properties of a TracesData.
                 * @deprecated Use opentelemetry.proto.trace.v1.TracesData.$Properties instead.
                 */
                interface ITracesData extends opentelemetry.proto.trace.v1.TracesData.$Properties {
                }

                /** Represents a TracesData. */
                class TracesData {

                    /**
                     * Constructs a new TracesData.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.trace.v1.TracesData.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** TracesData resourceSpans. */
                    resourceSpans: opentelemetry.proto.trace.v1.ResourceSpans.$Properties[];

                    /**
                     * Creates a new TracesData instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns TracesData instance
                     */
                    static create(properties: opentelemetry.proto.trace.v1.TracesData.$Shape): opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape;
                    static create(properties?: opentelemetry.proto.trace.v1.TracesData.$Properties): opentelemetry.proto.trace.v1.TracesData;

                    /**
                     * Encodes the specified TracesData message. Does not implicitly {@link opentelemetry.proto.trace.v1.TracesData.verify|verify} messages.
                     * @param message TracesData message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.trace.v1.TracesData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified TracesData message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.TracesData.verify|verify} messages.
                     * @param message TracesData message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.trace.v1.TracesData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a TracesData message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape} TracesData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape;

                    /**
                     * Decodes a TracesData message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape} TracesData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.trace.v1.TracesData & opentelemetry.proto.trace.v1.TracesData.$Shape;

                    /**
                     * Verifies a TracesData message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a TracesData message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns TracesData
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.trace.v1.TracesData;

                    /**
                     * Creates a plain object from a TracesData message. Also converts values to other types if specified.
                     * @param message TracesData
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.trace.v1.TracesData, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this TracesData to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for TracesData
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace TracesData {

                    /** Properties of a TracesData. */
                    interface $Properties {

                        /** TracesData resourceSpans */
                        resourceSpans?: (opentelemetry.proto.trace.v1.ResourceSpans.$Properties[]|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a TracesData. */
                    type $Shape = {
                      resourceSpans?: opentelemetry.proto.trace.v1.ResourceSpans.$Shape[]|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of a ResourceSpans.
                 * @deprecated Use opentelemetry.proto.trace.v1.ResourceSpans.$Properties instead.
                 */
                interface IResourceSpans extends opentelemetry.proto.trace.v1.ResourceSpans.$Properties {
                }

                /** Represents a ResourceSpans. */
                class ResourceSpans {

                    /**
                     * Constructs a new ResourceSpans.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.trace.v1.ResourceSpans.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** ResourceSpans resource. */
                    resource?: (opentelemetry.proto.resource.v1.Resource.$Properties|null);

                    /** ResourceSpans scopeSpans. */
                    scopeSpans: opentelemetry.proto.trace.v1.ScopeSpans.$Properties[];

                    /** ResourceSpans schemaUrl. */
                    schemaUrl: string;

                    /**
                     * Creates a new ResourceSpans instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ResourceSpans instance
                     */
                    static create(properties: opentelemetry.proto.trace.v1.ResourceSpans.$Shape): opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape;
                    static create(properties?: opentelemetry.proto.trace.v1.ResourceSpans.$Properties): opentelemetry.proto.trace.v1.ResourceSpans;

                    /**
                     * Encodes the specified ResourceSpans message. Does not implicitly {@link opentelemetry.proto.trace.v1.ResourceSpans.verify|verify} messages.
                     * @param message ResourceSpans message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.trace.v1.ResourceSpans.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ResourceSpans message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.ResourceSpans.verify|verify} messages.
                     * @param message ResourceSpans message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.trace.v1.ResourceSpans.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ResourceSpans message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape} ResourceSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape;

                    /**
                     * Decodes a ResourceSpans message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape} ResourceSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.trace.v1.ResourceSpans & opentelemetry.proto.trace.v1.ResourceSpans.$Shape;

                    /**
                     * Verifies a ResourceSpans message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ResourceSpans message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ResourceSpans
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.trace.v1.ResourceSpans;

                    /**
                     * Creates a plain object from a ResourceSpans message. Also converts values to other types if specified.
                     * @param message ResourceSpans
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.trace.v1.ResourceSpans, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ResourceSpans to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for ResourceSpans
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace ResourceSpans {

                    /** Properties of a ResourceSpans. */
                    interface $Properties {

                        /** ResourceSpans resource */
                        resource?: (opentelemetry.proto.resource.v1.Resource.$Properties|null);

                        /** ResourceSpans scopeSpans */
                        scopeSpans?: (opentelemetry.proto.trace.v1.ScopeSpans.$Properties[]|null);

                        /** ResourceSpans schemaUrl */
                        schemaUrl?: (string|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a ResourceSpans. */
                    type $Shape = {
                      resource?: opentelemetry.proto.resource.v1.Resource.$Shape|null;
                      scopeSpans?: opentelemetry.proto.trace.v1.ScopeSpans.$Shape[]|null;
                      schemaUrl?: string|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of a ScopeSpans.
                 * @deprecated Use opentelemetry.proto.trace.v1.ScopeSpans.$Properties instead.
                 */
                interface IScopeSpans extends opentelemetry.proto.trace.v1.ScopeSpans.$Properties {
                }

                /** Represents a ScopeSpans. */
                class ScopeSpans {

                    /**
                     * Constructs a new ScopeSpans.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.trace.v1.ScopeSpans.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** ScopeSpans scope. */
                    scope?: (opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null);

                    /** ScopeSpans spans. */
                    spans: opentelemetry.proto.trace.v1.Span.$Properties[];

                    /** ScopeSpans schemaUrl. */
                    schemaUrl: string;

                    /**
                     * Creates a new ScopeSpans instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ScopeSpans instance
                     */
                    static create(properties: opentelemetry.proto.trace.v1.ScopeSpans.$Shape): opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape;
                    static create(properties?: opentelemetry.proto.trace.v1.ScopeSpans.$Properties): opentelemetry.proto.trace.v1.ScopeSpans;

                    /**
                     * Encodes the specified ScopeSpans message. Does not implicitly {@link opentelemetry.proto.trace.v1.ScopeSpans.verify|verify} messages.
                     * @param message ScopeSpans message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.trace.v1.ScopeSpans.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ScopeSpans message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.ScopeSpans.verify|verify} messages.
                     * @param message ScopeSpans message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.trace.v1.ScopeSpans.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ScopeSpans message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape} ScopeSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape;

                    /**
                     * Decodes a ScopeSpans message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape} ScopeSpans
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.trace.v1.ScopeSpans & opentelemetry.proto.trace.v1.ScopeSpans.$Shape;

                    /**
                     * Verifies a ScopeSpans message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ScopeSpans message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ScopeSpans
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.trace.v1.ScopeSpans;

                    /**
                     * Creates a plain object from a ScopeSpans message. Also converts values to other types if specified.
                     * @param message ScopeSpans
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.trace.v1.ScopeSpans, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ScopeSpans to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for ScopeSpans
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace ScopeSpans {

                    /** Properties of a ScopeSpans. */
                    interface $Properties {

                        /** ScopeSpans scope */
                        scope?: (opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null);

                        /** ScopeSpans spans */
                        spans?: (opentelemetry.proto.trace.v1.Span.$Properties[]|null);

                        /** ScopeSpans schemaUrl */
                        schemaUrl?: (string|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a ScopeSpans. */
                    type $Shape = {
                      scope?: opentelemetry.proto.common.v1.InstrumentationScope.$Shape|null;
                      spans?: opentelemetry.proto.trace.v1.Span.$Shape[]|null;
                      schemaUrl?: string|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of a Span.
                 * @deprecated Use opentelemetry.proto.trace.v1.Span.$Properties instead.
                 */
                interface ISpan extends opentelemetry.proto.trace.v1.Span.$Properties {
                }

                /** Represents a Span. */
                class Span {

                    /**
                     * Constructs a new Span.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.trace.v1.Span.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** Span traceId. */
                    traceId: Uint8Array;

                    /** Span spanId. */
                    spanId: Uint8Array;

                    /** Span traceState. */
                    traceState: string;

                    /** Span parentSpanId. */
                    parentSpanId: Uint8Array;

                    /** Span flags. */
                    flags: number;

                    /** Span name. */
                    name: string;

                    /** Span kind. */
                    kind: opentelemetry.proto.trace.v1.Span.SpanKind;

                    /** Span startTimeUnixNano. */
                    startTimeUnixNano: (number|Long);

                    /** Span endTimeUnixNano. */
                    endTimeUnixNano: (number|Long);

                    /** Span attributes. */
                    attributes: opentelemetry.proto.common.v1.KeyValue.$Properties[];

                    /** Span droppedAttributesCount. */
                    droppedAttributesCount: number;

                    /** Span events. */
                    events: opentelemetry.proto.trace.v1.Span.Event.$Properties[];

                    /** Span droppedEventsCount. */
                    droppedEventsCount: number;

                    /** Span links. */
                    links: opentelemetry.proto.trace.v1.Span.Link.$Properties[];

                    /** Span droppedLinksCount. */
                    droppedLinksCount: number;

                    /** Span status. */
                    status?: (opentelemetry.proto.trace.v1.Status.$Properties|null);

                    /**
                     * Creates a new Span instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Span instance
                     */
                    static create(properties: opentelemetry.proto.trace.v1.Span.$Shape): opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape;
                    static create(properties?: opentelemetry.proto.trace.v1.Span.$Properties): opentelemetry.proto.trace.v1.Span;

                    /**
                     * Encodes the specified Span message. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.verify|verify} messages.
                     * @param message Span message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.trace.v1.Span.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Span message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.verify|verify} messages.
                     * @param message Span message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.trace.v1.Span.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Span message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape} Span
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape;

                    /**
                     * Decodes a Span message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape} Span
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.trace.v1.Span & opentelemetry.proto.trace.v1.Span.$Shape;

                    /**
                     * Verifies a Span message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Span message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Span
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.trace.v1.Span;

                    /**
                     * Creates a plain object from a Span message. Also converts values to other types if specified.
                     * @param message Span
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.trace.v1.Span, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Span to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for Span
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace Span {

                    /** Properties of a Span. */
                    interface $Properties {

                        /** Span traceId */
                        traceId?: (Uint8Array|null);

                        /** Span spanId */
                        spanId?: (Uint8Array|null);

                        /** Span traceState */
                        traceState?: (string|null);

                        /** Span parentSpanId */
                        parentSpanId?: (Uint8Array|null);

                        /** Span flags */
                        flags?: (number|null);

                        /** Span name */
                        name?: (string|null);

                        /** Span kind */
                        kind?: (opentelemetry.proto.trace.v1.Span.SpanKind|null);

                        /** Span startTimeUnixNano */
                        startTimeUnixNano?: (number|Long|null);

                        /** Span endTimeUnixNano */
                        endTimeUnixNano?: (number|Long|null);

                        /** Span attributes */
                        attributes?: (opentelemetry.proto.common.v1.KeyValue.$Properties[]|null);

                        /** Span droppedAttributesCount */
                        droppedAttributesCount?: (number|null);

                        /** Span events */
                        events?: (opentelemetry.proto.trace.v1.Span.Event.$Properties[]|null);

                        /** Span droppedEventsCount */
                        droppedEventsCount?: (number|null);

                        /** Span links */
                        links?: (opentelemetry.proto.trace.v1.Span.Link.$Properties[]|null);

                        /** Span droppedLinksCount */
                        droppedLinksCount?: (number|null);

                        /** Span status */
                        status?: (opentelemetry.proto.trace.v1.Status.$Properties|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a Span. */
                    type $Shape = {
                      traceId?: Uint8Array|null;
                      spanId?: Uint8Array|null;
                      traceState?: string|null;
                      parentSpanId?: Uint8Array|null;
                      flags?: number|null;
                      name?: string|null;
                      kind?: opentelemetry.proto.trace.v1.Span.SpanKind|null;
                      startTimeUnixNano?: number|Long|null;
                      endTimeUnixNano?: number|Long|null;
                      attributes?: opentelemetry.proto.common.v1.KeyValue.$Shape[]|null;
                      droppedAttributesCount?: number|null;
                      events?: opentelemetry.proto.trace.v1.Span.Event.$Shape[]|null;
                      droppedEventsCount?: number|null;
                      links?: opentelemetry.proto.trace.v1.Span.Link.$Shape[]|null;
                      droppedLinksCount?: number|null;
                      status?: opentelemetry.proto.trace.v1.Status.$Shape|null;
                      $unknowns?: Uint8Array[];
                    };

                    /** SpanKind enum. */
                    enum SpanKind {

                        /** SPAN_KIND_UNSPECIFIED value */
                        SPAN_KIND_UNSPECIFIED = 0,

                        /** SPAN_KIND_INTERNAL value */
                        SPAN_KIND_INTERNAL = 1,

                        /** SPAN_KIND_SERVER value */
                        SPAN_KIND_SERVER = 2,

                        /** SPAN_KIND_CLIENT value */
                        SPAN_KIND_CLIENT = 3,

                        /** SPAN_KIND_PRODUCER value */
                        SPAN_KIND_PRODUCER = 4,

                        /** SPAN_KIND_CONSUMER value */
                        SPAN_KIND_CONSUMER = 5
                    }

                    /**
                     * Properties of an Event.
                     * @deprecated Use opentelemetry.proto.trace.v1.Span.Event.$Properties instead.
                     */
                    interface IEvent extends opentelemetry.proto.trace.v1.Span.Event.$Properties {
                    }

                    /** Represents an Event. */
                    class Event {

                        /**
                         * Constructs a new Event.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.trace.v1.Span.Event.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** Event timeUnixNano. */
                        timeUnixNano: (number|Long);

                        /** Event name. */
                        name: string;

                        /** Event attributes. */
                        attributes: opentelemetry.proto.common.v1.KeyValue.$Properties[];

                        /** Event droppedAttributesCount. */
                        droppedAttributesCount: number;

                        /**
                         * Creates a new Event instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Event instance
                         */
                        static create(properties: opentelemetry.proto.trace.v1.Span.Event.$Shape): opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape;
                        static create(properties?: opentelemetry.proto.trace.v1.Span.Event.$Properties): opentelemetry.proto.trace.v1.Span.Event;

                        /**
                         * Encodes the specified Event message. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Event.verify|verify} messages.
                         * @param message Event message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.trace.v1.Span.Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Event message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Event.verify|verify} messages.
                         * @param message Event message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.trace.v1.Span.Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an Event message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape} Event
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape;

                        /**
                         * Decodes an Event message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape} Event
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.trace.v1.Span.Event & opentelemetry.proto.trace.v1.Span.Event.$Shape;

                        /**
                         * Verifies an Event message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an Event message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Event
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.trace.v1.Span.Event;

                        /**
                         * Creates a plain object from an Event message. Also converts values to other types if specified.
                         * @param message Event
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.trace.v1.Span.Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Event to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for Event
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace Event {

                        /** Properties of an Event. */
                        interface $Properties {

                            /** Event timeUnixNano */
                            timeUnixNano?: (number|Long|null);

                            /** Event name */
                            name?: (string|null);

                            /** Event attributes */
                            attributes?: (opentelemetry.proto.common.v1.KeyValue.$Properties[]|null);

                            /** Event droppedAttributesCount */
                            droppedAttributesCount?: (number|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an Event. */
                        type $Shape = {
                          timeUnixNano?: number|Long|null;
                          name?: string|null;
                          attributes?: opentelemetry.proto.common.v1.KeyValue.$Shape[]|null;
                          droppedAttributesCount?: number|null;
                          $unknowns?: Uint8Array[];
                        };
                    }

                    /**
                     * Properties of a Link.
                     * @deprecated Use opentelemetry.proto.trace.v1.Span.Link.$Properties instead.
                     */
                    interface ILink extends opentelemetry.proto.trace.v1.Span.Link.$Properties {
                    }

                    /** Represents a Link. */
                    class Link {

                        /**
                         * Constructs a new Link.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: opentelemetry.proto.trace.v1.Span.Link.$Properties);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];

                        /** Link traceId. */
                        traceId: Uint8Array;

                        /** Link spanId. */
                        spanId: Uint8Array;

                        /** Link traceState. */
                        traceState: string;

                        /** Link attributes. */
                        attributes: opentelemetry.proto.common.v1.KeyValue.$Properties[];

                        /** Link droppedAttributesCount. */
                        droppedAttributesCount: number;

                        /** Link flags. */
                        flags: number;

                        /**
                         * Creates a new Link instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Link instance
                         */
                        static create(properties: opentelemetry.proto.trace.v1.Span.Link.$Shape): opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape;
                        static create(properties?: opentelemetry.proto.trace.v1.Span.Link.$Properties): opentelemetry.proto.trace.v1.Span.Link;

                        /**
                         * Encodes the specified Link message. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Link.verify|verify} messages.
                         * @param message Link message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: opentelemetry.proto.trace.v1.Span.Link.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Link message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Span.Link.verify|verify} messages.
                         * @param message Link message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encodeDelimited(message: opentelemetry.proto.trace.v1.Span.Link.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Link message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape} Link
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape;

                        /**
                         * Decodes a Link message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns {opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape} Link
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.trace.v1.Span.Link & opentelemetry.proto.trace.v1.Span.Link.$Shape;

                        /**
                         * Verifies a Link message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Link message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Link
                         */
                        static fromObject(object: { [k: string]: any }): opentelemetry.proto.trace.v1.Span.Link;

                        /**
                         * Creates a plain object from a Link message. Also converts values to other types if specified.
                         * @param message Link
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        static toObject(message: opentelemetry.proto.trace.v1.Span.Link, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Link to JSON.
                         * @returns JSON object
                         */
                        toJSON(): { [k: string]: any };

                        /**
                         * Gets the type url for Link
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace Link {

                        /** Properties of a Link. */
                        interface $Properties {

                            /** Link traceId */
                            traceId?: (Uint8Array|null);

                            /** Link spanId */
                            spanId?: (Uint8Array|null);

                            /** Link traceState */
                            traceState?: (string|null);

                            /** Link attributes */
                            attributes?: (opentelemetry.proto.common.v1.KeyValue.$Properties[]|null);

                            /** Link droppedAttributesCount */
                            droppedAttributesCount?: (number|null);

                            /** Link flags */
                            flags?: (number|null);

                            /** Unknown fields preserved while decoding when enabled */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a Link. */
                        type $Shape = {
                          traceId?: Uint8Array|null;
                          spanId?: Uint8Array|null;
                          traceState?: string|null;
                          attributes?: opentelemetry.proto.common.v1.KeyValue.$Shape[]|null;
                          droppedAttributesCount?: number|null;
                          flags?: number|null;
                          $unknowns?: Uint8Array[];
                        };
                    }
                }

                /**
                 * Properties of a Status.
                 * @deprecated Use opentelemetry.proto.trace.v1.Status.$Properties instead.
                 */
                interface IStatus extends opentelemetry.proto.trace.v1.Status.$Properties {
                }

                /** Represents a Status. */
                class Status {

                    /**
                     * Constructs a new Status.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.trace.v1.Status.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** Status message. */
                    message: string;

                    /** Status code. */
                    code: opentelemetry.proto.trace.v1.Status.StatusCode;

                    /**
                     * Creates a new Status instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Status instance
                     */
                    static create(properties: opentelemetry.proto.trace.v1.Status.$Shape): opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape;
                    static create(properties?: opentelemetry.proto.trace.v1.Status.$Properties): opentelemetry.proto.trace.v1.Status;

                    /**
                     * Encodes the specified Status message. Does not implicitly {@link opentelemetry.proto.trace.v1.Status.verify|verify} messages.
                     * @param message Status message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.trace.v1.Status.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Status message, length delimited. Does not implicitly {@link opentelemetry.proto.trace.v1.Status.verify|verify} messages.
                     * @param message Status message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.trace.v1.Status.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Status message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape} Status
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape;

                    /**
                     * Decodes a Status message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape} Status
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.trace.v1.Status & opentelemetry.proto.trace.v1.Status.$Shape;

                    /**
                     * Verifies a Status message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Status message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Status
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.trace.v1.Status;

                    /**
                     * Creates a plain object from a Status message. Also converts values to other types if specified.
                     * @param message Status
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.trace.v1.Status, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Status to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for Status
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace Status {

                    /** Properties of a Status. */
                    interface $Properties {

                        /** Status message */
                        message?: (string|null);

                        /** Status code */
                        code?: (opentelemetry.proto.trace.v1.Status.StatusCode|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a Status. */
                    type $Shape = opentelemetry.proto.trace.v1.Status.$Properties;

                    /** StatusCode enum. */
                    enum StatusCode {

                        /** STATUS_CODE_UNSET value */
                        STATUS_CODE_UNSET = 0,

                        /** STATUS_CODE_OK value */
                        STATUS_CODE_OK = 1,

                        /** STATUS_CODE_ERROR value */
                        STATUS_CODE_ERROR = 2
                    }
                }

                /** SpanFlags enum. */
                enum SpanFlags {

                    /** SPAN_FLAGS_DO_NOT_USE value */
                    SPAN_FLAGS_DO_NOT_USE = 0,

                    /** SPAN_FLAGS_TRACE_FLAGS_MASK value */
                    SPAN_FLAGS_TRACE_FLAGS_MASK = 255,

                    /** SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK value */
                    SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK = 256,

                    /** SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK value */
                    SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK = 512
                }
            }
        }

        /** Namespace common. */
        namespace common {

            /** Namespace v1. */
            namespace v1 {

                /**
                 * Properties of an AnyValue.
                 * @deprecated Use opentelemetry.proto.common.v1.AnyValue.$Properties instead.
                 */
                interface IAnyValue extends opentelemetry.proto.common.v1.AnyValue.$Properties {
                }

                /** Represents an AnyValue. */
                class AnyValue {

                    /**
                     * Constructs a new AnyValue.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.common.v1.AnyValue.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** AnyValue stringValue. */
                    stringValue?: (string|null);

                    /** AnyValue boolValue. */
                    boolValue?: (boolean|null);

                    /** AnyValue intValue. */
                    intValue?: (number|Long|null);

                    /** AnyValue doubleValue. */
                    doubleValue?: (number|null);

                    /** AnyValue arrayValue. */
                    arrayValue?: (opentelemetry.proto.common.v1.ArrayValue.$Properties|null);

                    /** AnyValue kvlistValue. */
                    kvlistValue?: (opentelemetry.proto.common.v1.KeyValueList.$Properties|null);

                    /** AnyValue bytesValue. */
                    bytesValue?: (Uint8Array|null);

                    /** AnyValue value. */
                    value?: ("stringValue"|"boolValue"|"intValue"|"doubleValue"|"arrayValue"|"kvlistValue"|"bytesValue");

                    /**
                     * Creates a new AnyValue instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns AnyValue instance
                     */
                    static create(properties: opentelemetry.proto.common.v1.AnyValue.$Shape): opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape;
                    static create(properties?: opentelemetry.proto.common.v1.AnyValue.$Properties): opentelemetry.proto.common.v1.AnyValue;

                    /**
                     * Encodes the specified AnyValue message. Does not implicitly {@link opentelemetry.proto.common.v1.AnyValue.verify|verify} messages.
                     * @param message AnyValue message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.common.v1.AnyValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified AnyValue message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.AnyValue.verify|verify} messages.
                     * @param message AnyValue message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.common.v1.AnyValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an AnyValue message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape} AnyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape;

                    /**
                     * Decodes an AnyValue message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape} AnyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.common.v1.AnyValue & opentelemetry.proto.common.v1.AnyValue.$Shape;

                    /**
                     * Verifies an AnyValue message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an AnyValue message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns AnyValue
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.common.v1.AnyValue;

                    /**
                     * Creates a plain object from an AnyValue message. Also converts values to other types if specified.
                     * @param message AnyValue
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.common.v1.AnyValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this AnyValue to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for AnyValue
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace AnyValue {

                    /** Properties of an AnyValue. */
                    interface $Properties {

                        /** AnyValue stringValue */
                        stringValue?: (string|null);

                        /** AnyValue boolValue */
                        boolValue?: (boolean|null);

                        /** AnyValue intValue */
                        intValue?: (number|Long|null);

                        /** AnyValue doubleValue */
                        doubleValue?: (number|null);

                        /** AnyValue arrayValue */
                        arrayValue?: (opentelemetry.proto.common.v1.ArrayValue.$Properties|null);

                        /** AnyValue kvlistValue */
                        kvlistValue?: (opentelemetry.proto.common.v1.KeyValueList.$Properties|null);

                        /** AnyValue bytesValue */
                        bytesValue?: (Uint8Array|null);

                        /** AnyValue value */
                        value?: ("stringValue"|"boolValue"|"intValue"|"doubleValue"|"arrayValue"|"kvlistValue"|"bytesValue");

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Narrowed shape of an AnyValue. */
                    type $Shape = {
                      stringValue?: string|null;
                      boolValue?: boolean|null;
                      intValue?: number|Long|null;
                      doubleValue?: number|null;
                      arrayValue?: opentelemetry.proto.common.v1.ArrayValue.$Shape|null;
                      kvlistValue?: opentelemetry.proto.common.v1.KeyValueList.$Shape|null;
                      bytesValue?: Uint8Array|null;
                      $unknowns?: Uint8Array[];
                    } & (
                      ({ value?: undefined; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "stringValue"; stringValue: string; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "boolValue"; stringValue?: null; boolValue: boolean; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "intValue"; stringValue?: null; boolValue?: null; intValue: number|Long; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "doubleValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue: number; arrayValue?: null; kvlistValue?: null; bytesValue?: null }|{ value?: "arrayValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue: opentelemetry.proto.common.v1.ArrayValue.$Shape; kvlistValue?: null; bytesValue?: null }|{ value?: "kvlistValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue: opentelemetry.proto.common.v1.KeyValueList.$Shape; bytesValue?: null }|{ value?: "bytesValue"; stringValue?: null; boolValue?: null; intValue?: null; doubleValue?: null; arrayValue?: null; kvlistValue?: null; bytesValue: Uint8Array })
                    );
                }

                /**
                 * Properties of an ArrayValue.
                 * @deprecated Use opentelemetry.proto.common.v1.ArrayValue.$Properties instead.
                 */
                interface IArrayValue extends opentelemetry.proto.common.v1.ArrayValue.$Properties {
                }

                /** Represents an ArrayValue. */
                class ArrayValue {

                    /**
                     * Constructs a new ArrayValue.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.common.v1.ArrayValue.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** ArrayValue values. */
                    values: opentelemetry.proto.common.v1.AnyValue.$Properties[];

                    /**
                     * Creates a new ArrayValue instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ArrayValue instance
                     */
                    static create(properties: opentelemetry.proto.common.v1.ArrayValue.$Shape): opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape;
                    static create(properties?: opentelemetry.proto.common.v1.ArrayValue.$Properties): opentelemetry.proto.common.v1.ArrayValue;

                    /**
                     * Encodes the specified ArrayValue message. Does not implicitly {@link opentelemetry.proto.common.v1.ArrayValue.verify|verify} messages.
                     * @param message ArrayValue message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.common.v1.ArrayValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ArrayValue message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.ArrayValue.verify|verify} messages.
                     * @param message ArrayValue message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.common.v1.ArrayValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an ArrayValue message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape} ArrayValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape;

                    /**
                     * Decodes an ArrayValue message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape} ArrayValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.common.v1.ArrayValue & opentelemetry.proto.common.v1.ArrayValue.$Shape;

                    /**
                     * Verifies an ArrayValue message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an ArrayValue message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ArrayValue
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.common.v1.ArrayValue;

                    /**
                     * Creates a plain object from an ArrayValue message. Also converts values to other types if specified.
                     * @param message ArrayValue
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.common.v1.ArrayValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ArrayValue to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for ArrayValue
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace ArrayValue {

                    /** Properties of an ArrayValue. */
                    interface $Properties {

                        /** ArrayValue values */
                        values?: (opentelemetry.proto.common.v1.AnyValue.$Properties[]|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of an ArrayValue. */
                    type $Shape = {
                      values?: opentelemetry.proto.common.v1.AnyValue.$Shape[]|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of a KeyValueList.
                 * @deprecated Use opentelemetry.proto.common.v1.KeyValueList.$Properties instead.
                 */
                interface IKeyValueList extends opentelemetry.proto.common.v1.KeyValueList.$Properties {
                }

                /** Represents a KeyValueList. */
                class KeyValueList {

                    /**
                     * Constructs a new KeyValueList.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.common.v1.KeyValueList.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** KeyValueList values. */
                    values: opentelemetry.proto.common.v1.KeyValue.$Properties[];

                    /**
                     * Creates a new KeyValueList instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns KeyValueList instance
                     */
                    static create(properties: opentelemetry.proto.common.v1.KeyValueList.$Shape): opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape;
                    static create(properties?: opentelemetry.proto.common.v1.KeyValueList.$Properties): opentelemetry.proto.common.v1.KeyValueList;

                    /**
                     * Encodes the specified KeyValueList message. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValueList.verify|verify} messages.
                     * @param message KeyValueList message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.common.v1.KeyValueList.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified KeyValueList message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValueList.verify|verify} messages.
                     * @param message KeyValueList message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.common.v1.KeyValueList.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a KeyValueList message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape} KeyValueList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape;

                    /**
                     * Decodes a KeyValueList message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape} KeyValueList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.common.v1.KeyValueList & opentelemetry.proto.common.v1.KeyValueList.$Shape;

                    /**
                     * Verifies a KeyValueList message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a KeyValueList message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns KeyValueList
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.common.v1.KeyValueList;

                    /**
                     * Creates a plain object from a KeyValueList message. Also converts values to other types if specified.
                     * @param message KeyValueList
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.common.v1.KeyValueList, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this KeyValueList to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for KeyValueList
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace KeyValueList {

                    /** Properties of a KeyValueList. */
                    interface $Properties {

                        /** KeyValueList values */
                        values?: (opentelemetry.proto.common.v1.KeyValue.$Properties[]|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a KeyValueList. */
                    type $Shape = {
                      values?: opentelemetry.proto.common.v1.KeyValue.$Shape[]|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of a KeyValue.
                 * @deprecated Use opentelemetry.proto.common.v1.KeyValue.$Properties instead.
                 */
                interface IKeyValue extends opentelemetry.proto.common.v1.KeyValue.$Properties {
                }

                /** Represents a KeyValue. */
                class KeyValue {

                    /**
                     * Constructs a new KeyValue.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.common.v1.KeyValue.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** KeyValue key. */
                    key: string;

                    /** KeyValue value. */
                    value?: (opentelemetry.proto.common.v1.AnyValue.$Properties|null);

                    /**
                     * Creates a new KeyValue instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns KeyValue instance
                     */
                    static create(properties: opentelemetry.proto.common.v1.KeyValue.$Shape): opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape;
                    static create(properties?: opentelemetry.proto.common.v1.KeyValue.$Properties): opentelemetry.proto.common.v1.KeyValue;

                    /**
                     * Encodes the specified KeyValue message. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValue.verify|verify} messages.
                     * @param message KeyValue message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.common.v1.KeyValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified KeyValue message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.KeyValue.verify|verify} messages.
                     * @param message KeyValue message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.common.v1.KeyValue.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a KeyValue message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape} KeyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape;

                    /**
                     * Decodes a KeyValue message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape} KeyValue
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.common.v1.KeyValue & opentelemetry.proto.common.v1.KeyValue.$Shape;

                    /**
                     * Verifies a KeyValue message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a KeyValue message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns KeyValue
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.common.v1.KeyValue;

                    /**
                     * Creates a plain object from a KeyValue message. Also converts values to other types if specified.
                     * @param message KeyValue
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.common.v1.KeyValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this KeyValue to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for KeyValue
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace KeyValue {

                    /** Properties of a KeyValue. */
                    interface $Properties {

                        /** KeyValue key */
                        key?: (string|null);

                        /** KeyValue value */
                        value?: (opentelemetry.proto.common.v1.AnyValue.$Properties|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a KeyValue. */
                    type $Shape = {
                      key?: string|null;
                      value?: opentelemetry.proto.common.v1.AnyValue.$Shape|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of an InstrumentationScope.
                 * @deprecated Use opentelemetry.proto.common.v1.InstrumentationScope.$Properties instead.
                 */
                interface IInstrumentationScope extends opentelemetry.proto.common.v1.InstrumentationScope.$Properties {
                }

                /** Represents an InstrumentationScope. */
                class InstrumentationScope {

                    /**
                     * Constructs a new InstrumentationScope.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.common.v1.InstrumentationScope.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** InstrumentationScope name. */
                    name: string;

                    /** InstrumentationScope version. */
                    version: string;

                    /** InstrumentationScope attributes. */
                    attributes: opentelemetry.proto.common.v1.KeyValue.$Properties[];

                    /** InstrumentationScope droppedAttributesCount. */
                    droppedAttributesCount: number;

                    /**
                     * Creates a new InstrumentationScope instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns InstrumentationScope instance
                     */
                    static create(properties: opentelemetry.proto.common.v1.InstrumentationScope.$Shape): opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape;
                    static create(properties?: opentelemetry.proto.common.v1.InstrumentationScope.$Properties): opentelemetry.proto.common.v1.InstrumentationScope;

                    /**
                     * Encodes the specified InstrumentationScope message. Does not implicitly {@link opentelemetry.proto.common.v1.InstrumentationScope.verify|verify} messages.
                     * @param message InstrumentationScope message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.common.v1.InstrumentationScope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified InstrumentationScope message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.InstrumentationScope.verify|verify} messages.
                     * @param message InstrumentationScope message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.common.v1.InstrumentationScope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an InstrumentationScope message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape} InstrumentationScope
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape;

                    /**
                     * Decodes an InstrumentationScope message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape} InstrumentationScope
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.common.v1.InstrumentationScope & opentelemetry.proto.common.v1.InstrumentationScope.$Shape;

                    /**
                     * Verifies an InstrumentationScope message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an InstrumentationScope message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns InstrumentationScope
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.common.v1.InstrumentationScope;

                    /**
                     * Creates a plain object from an InstrumentationScope message. Also converts values to other types if specified.
                     * @param message InstrumentationScope
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.common.v1.InstrumentationScope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this InstrumentationScope to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for InstrumentationScope
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace InstrumentationScope {

                    /** Properties of an InstrumentationScope. */
                    interface $Properties {

                        /** InstrumentationScope name */
                        name?: (string|null);

                        /** InstrumentationScope version */
                        version?: (string|null);

                        /** InstrumentationScope attributes */
                        attributes?: (opentelemetry.proto.common.v1.KeyValue.$Properties[]|null);

                        /** InstrumentationScope droppedAttributesCount */
                        droppedAttributesCount?: (number|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of an InstrumentationScope. */
                    type $Shape = {
                      name?: string|null;
                      version?: string|null;
                      attributes?: opentelemetry.proto.common.v1.KeyValue.$Shape[]|null;
                      droppedAttributesCount?: number|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of an EntityRef.
                 * @deprecated Use opentelemetry.proto.common.v1.EntityRef.$Properties instead.
                 */
                interface IEntityRef extends opentelemetry.proto.common.v1.EntityRef.$Properties {
                }

                /** Represents an EntityRef. */
                class EntityRef {

                    /**
                     * Constructs a new EntityRef.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.common.v1.EntityRef.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** EntityRef schemaUrl. */
                    schemaUrl: string;

                    /** EntityRef type. */
                    type: string;

                    /** EntityRef idKeys. */
                    idKeys: string[];

                    /** EntityRef descriptionKeys. */
                    descriptionKeys: string[];

                    /**
                     * Creates a new EntityRef instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns EntityRef instance
                     */
                    static create(properties: opentelemetry.proto.common.v1.EntityRef.$Shape): opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape;
                    static create(properties?: opentelemetry.proto.common.v1.EntityRef.$Properties): opentelemetry.proto.common.v1.EntityRef;

                    /**
                     * Encodes the specified EntityRef message. Does not implicitly {@link opentelemetry.proto.common.v1.EntityRef.verify|verify} messages.
                     * @param message EntityRef message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.common.v1.EntityRef.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified EntityRef message, length delimited. Does not implicitly {@link opentelemetry.proto.common.v1.EntityRef.verify|verify} messages.
                     * @param message EntityRef message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.common.v1.EntityRef.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an EntityRef message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape} EntityRef
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape;

                    /**
                     * Decodes an EntityRef message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape} EntityRef
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.common.v1.EntityRef & opentelemetry.proto.common.v1.EntityRef.$Shape;

                    /**
                     * Verifies an EntityRef message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an EntityRef message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns EntityRef
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.common.v1.EntityRef;

                    /**
                     * Creates a plain object from an EntityRef message. Also converts values to other types if specified.
                     * @param message EntityRef
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.common.v1.EntityRef, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this EntityRef to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for EntityRef
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace EntityRef {

                    /** Properties of an EntityRef. */
                    interface $Properties {

                        /** EntityRef schemaUrl */
                        schemaUrl?: (string|null);

                        /** EntityRef type */
                        type?: (string|null);

                        /** EntityRef idKeys */
                        idKeys?: (string[]|null);

                        /** EntityRef descriptionKeys */
                        descriptionKeys?: (string[]|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of an EntityRef. */
                    type $Shape = opentelemetry.proto.common.v1.EntityRef.$Properties;
                }
            }
        }

        /** Namespace resource. */
        namespace resource {

            /** Namespace v1. */
            namespace v1 {

                /**
                 * Properties of a Resource.
                 * @deprecated Use opentelemetry.proto.resource.v1.Resource.$Properties instead.
                 */
                interface IResource extends opentelemetry.proto.resource.v1.Resource.$Properties {
                }

                /** Represents a Resource. */
                class Resource {

                    /**
                     * Constructs a new Resource.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.resource.v1.Resource.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** Resource attributes. */
                    attributes: opentelemetry.proto.common.v1.KeyValue.$Properties[];

                    /** Resource droppedAttributesCount. */
                    droppedAttributesCount: number;

                    /** Resource entityRefs. */
                    entityRefs: opentelemetry.proto.common.v1.EntityRef.$Properties[];

                    /**
                     * Creates a new Resource instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Resource instance
                     */
                    static create(properties: opentelemetry.proto.resource.v1.Resource.$Shape): opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape;
                    static create(properties?: opentelemetry.proto.resource.v1.Resource.$Properties): opentelemetry.proto.resource.v1.Resource;

                    /**
                     * Encodes the specified Resource message. Does not implicitly {@link opentelemetry.proto.resource.v1.Resource.verify|verify} messages.
                     * @param message Resource message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.resource.v1.Resource.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Resource message, length delimited. Does not implicitly {@link opentelemetry.proto.resource.v1.Resource.verify|verify} messages.
                     * @param message Resource message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.resource.v1.Resource.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Resource message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape} Resource
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape;

                    /**
                     * Decodes a Resource message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape} Resource
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.resource.v1.Resource & opentelemetry.proto.resource.v1.Resource.$Shape;

                    /**
                     * Verifies a Resource message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Resource message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Resource
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.resource.v1.Resource;

                    /**
                     * Creates a plain object from a Resource message. Also converts values to other types if specified.
                     * @param message Resource
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.resource.v1.Resource, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Resource to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for Resource
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace Resource {

                    /** Properties of a Resource. */
                    interface $Properties {

                        /** Resource attributes */
                        attributes?: (opentelemetry.proto.common.v1.KeyValue.$Properties[]|null);

                        /** Resource droppedAttributesCount */
                        droppedAttributesCount?: (number|null);

                        /** Resource entityRefs */
                        entityRefs?: (opentelemetry.proto.common.v1.EntityRef.$Properties[]|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a Resource. */
                    type $Shape = {
                      attributes?: opentelemetry.proto.common.v1.KeyValue.$Shape[]|null;
                      droppedAttributesCount?: number|null;
                      entityRefs?: opentelemetry.proto.common.v1.EntityRef.$Shape[]|null;
                      $unknowns?: Uint8Array[];
                    };
                }
            }
        }

        /** Namespace logs. */
        namespace logs {

            /** Namespace v1. */
            namespace v1 {

                /**
                 * Properties of a LogsData.
                 * @deprecated Use opentelemetry.proto.logs.v1.LogsData.$Properties instead.
                 */
                interface ILogsData extends opentelemetry.proto.logs.v1.LogsData.$Properties {
                }

                /** Represents a LogsData. */
                class LogsData {

                    /**
                     * Constructs a new LogsData.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.logs.v1.LogsData.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** LogsData resourceLogs. */
                    resourceLogs: opentelemetry.proto.logs.v1.ResourceLogs.$Properties[];

                    /**
                     * Creates a new LogsData instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns LogsData instance
                     */
                    static create(properties: opentelemetry.proto.logs.v1.LogsData.$Shape): opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape;
                    static create(properties?: opentelemetry.proto.logs.v1.LogsData.$Properties): opentelemetry.proto.logs.v1.LogsData;

                    /**
                     * Encodes the specified LogsData message. Does not implicitly {@link opentelemetry.proto.logs.v1.LogsData.verify|verify} messages.
                     * @param message LogsData message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.logs.v1.LogsData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified LogsData message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.LogsData.verify|verify} messages.
                     * @param message LogsData message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.logs.v1.LogsData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a LogsData message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape} LogsData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape;

                    /**
                     * Decodes a LogsData message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape} LogsData
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.logs.v1.LogsData & opentelemetry.proto.logs.v1.LogsData.$Shape;

                    /**
                     * Verifies a LogsData message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a LogsData message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns LogsData
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.logs.v1.LogsData;

                    /**
                     * Creates a plain object from a LogsData message. Also converts values to other types if specified.
                     * @param message LogsData
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.logs.v1.LogsData, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this LogsData to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for LogsData
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace LogsData {

                    /** Properties of a LogsData. */
                    interface $Properties {

                        /** LogsData resourceLogs */
                        resourceLogs?: (opentelemetry.proto.logs.v1.ResourceLogs.$Properties[]|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a LogsData. */
                    type $Shape = {
                      resourceLogs?: opentelemetry.proto.logs.v1.ResourceLogs.$Shape[]|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of a ResourceLogs.
                 * @deprecated Use opentelemetry.proto.logs.v1.ResourceLogs.$Properties instead.
                 */
                interface IResourceLogs extends opentelemetry.proto.logs.v1.ResourceLogs.$Properties {
                }

                /** Represents a ResourceLogs. */
                class ResourceLogs {

                    /**
                     * Constructs a new ResourceLogs.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.logs.v1.ResourceLogs.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** ResourceLogs resource. */
                    resource?: (opentelemetry.proto.resource.v1.Resource.$Properties|null);

                    /** ResourceLogs scopeLogs. */
                    scopeLogs: opentelemetry.proto.logs.v1.ScopeLogs.$Properties[];

                    /** ResourceLogs schemaUrl. */
                    schemaUrl: string;

                    /**
                     * Creates a new ResourceLogs instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ResourceLogs instance
                     */
                    static create(properties: opentelemetry.proto.logs.v1.ResourceLogs.$Shape): opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape;
                    static create(properties?: opentelemetry.proto.logs.v1.ResourceLogs.$Properties): opentelemetry.proto.logs.v1.ResourceLogs;

                    /**
                     * Encodes the specified ResourceLogs message. Does not implicitly {@link opentelemetry.proto.logs.v1.ResourceLogs.verify|verify} messages.
                     * @param message ResourceLogs message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.logs.v1.ResourceLogs.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ResourceLogs message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.ResourceLogs.verify|verify} messages.
                     * @param message ResourceLogs message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.logs.v1.ResourceLogs.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ResourceLogs message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape} ResourceLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape;

                    /**
                     * Decodes a ResourceLogs message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape} ResourceLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.logs.v1.ResourceLogs & opentelemetry.proto.logs.v1.ResourceLogs.$Shape;

                    /**
                     * Verifies a ResourceLogs message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ResourceLogs message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ResourceLogs
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.logs.v1.ResourceLogs;

                    /**
                     * Creates a plain object from a ResourceLogs message. Also converts values to other types if specified.
                     * @param message ResourceLogs
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.logs.v1.ResourceLogs, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ResourceLogs to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for ResourceLogs
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace ResourceLogs {

                    /** Properties of a ResourceLogs. */
                    interface $Properties {

                        /** ResourceLogs resource */
                        resource?: (opentelemetry.proto.resource.v1.Resource.$Properties|null);

                        /** ResourceLogs scopeLogs */
                        scopeLogs?: (opentelemetry.proto.logs.v1.ScopeLogs.$Properties[]|null);

                        /** ResourceLogs schemaUrl */
                        schemaUrl?: (string|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a ResourceLogs. */
                    type $Shape = {
                      resource?: opentelemetry.proto.resource.v1.Resource.$Shape|null;
                      scopeLogs?: opentelemetry.proto.logs.v1.ScopeLogs.$Shape[]|null;
                      schemaUrl?: string|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /**
                 * Properties of a ScopeLogs.
                 * @deprecated Use opentelemetry.proto.logs.v1.ScopeLogs.$Properties instead.
                 */
                interface IScopeLogs extends opentelemetry.proto.logs.v1.ScopeLogs.$Properties {
                }

                /** Represents a ScopeLogs. */
                class ScopeLogs {

                    /**
                     * Constructs a new ScopeLogs.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.logs.v1.ScopeLogs.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** ScopeLogs scope. */
                    scope?: (opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null);

                    /** ScopeLogs logRecords. */
                    logRecords: opentelemetry.proto.logs.v1.LogRecord.$Properties[];

                    /** ScopeLogs schemaUrl. */
                    schemaUrl: string;

                    /**
                     * Creates a new ScopeLogs instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ScopeLogs instance
                     */
                    static create(properties: opentelemetry.proto.logs.v1.ScopeLogs.$Shape): opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape;
                    static create(properties?: opentelemetry.proto.logs.v1.ScopeLogs.$Properties): opentelemetry.proto.logs.v1.ScopeLogs;

                    /**
                     * Encodes the specified ScopeLogs message. Does not implicitly {@link opentelemetry.proto.logs.v1.ScopeLogs.verify|verify} messages.
                     * @param message ScopeLogs message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.logs.v1.ScopeLogs.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ScopeLogs message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.ScopeLogs.verify|verify} messages.
                     * @param message ScopeLogs message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.logs.v1.ScopeLogs.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ScopeLogs message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape} ScopeLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape;

                    /**
                     * Decodes a ScopeLogs message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape} ScopeLogs
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.logs.v1.ScopeLogs & opentelemetry.proto.logs.v1.ScopeLogs.$Shape;

                    /**
                     * Verifies a ScopeLogs message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ScopeLogs message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ScopeLogs
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.logs.v1.ScopeLogs;

                    /**
                     * Creates a plain object from a ScopeLogs message. Also converts values to other types if specified.
                     * @param message ScopeLogs
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.logs.v1.ScopeLogs, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ScopeLogs to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for ScopeLogs
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace ScopeLogs {

                    /** Properties of a ScopeLogs. */
                    interface $Properties {

                        /** ScopeLogs scope */
                        scope?: (opentelemetry.proto.common.v1.InstrumentationScope.$Properties|null);

                        /** ScopeLogs logRecords */
                        logRecords?: (opentelemetry.proto.logs.v1.LogRecord.$Properties[]|null);

                        /** ScopeLogs schemaUrl */
                        schemaUrl?: (string|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a ScopeLogs. */
                    type $Shape = {
                      scope?: opentelemetry.proto.common.v1.InstrumentationScope.$Shape|null;
                      logRecords?: opentelemetry.proto.logs.v1.LogRecord.$Shape[]|null;
                      schemaUrl?: string|null;
                      $unknowns?: Uint8Array[];
                    };
                }

                /** SeverityNumber enum. */
                enum SeverityNumber {

                    /** SEVERITY_NUMBER_UNSPECIFIED value */
                    SEVERITY_NUMBER_UNSPECIFIED = 0,

                    /** SEVERITY_NUMBER_TRACE value */
                    SEVERITY_NUMBER_TRACE = 1,

                    /** SEVERITY_NUMBER_TRACE2 value */
                    SEVERITY_NUMBER_TRACE2 = 2,

                    /** SEVERITY_NUMBER_TRACE3 value */
                    SEVERITY_NUMBER_TRACE3 = 3,

                    /** SEVERITY_NUMBER_TRACE4 value */
                    SEVERITY_NUMBER_TRACE4 = 4,

                    /** SEVERITY_NUMBER_DEBUG value */
                    SEVERITY_NUMBER_DEBUG = 5,

                    /** SEVERITY_NUMBER_DEBUG2 value */
                    SEVERITY_NUMBER_DEBUG2 = 6,

                    /** SEVERITY_NUMBER_DEBUG3 value */
                    SEVERITY_NUMBER_DEBUG3 = 7,

                    /** SEVERITY_NUMBER_DEBUG4 value */
                    SEVERITY_NUMBER_DEBUG4 = 8,

                    /** SEVERITY_NUMBER_INFO value */
                    SEVERITY_NUMBER_INFO = 9,

                    /** SEVERITY_NUMBER_INFO2 value */
                    SEVERITY_NUMBER_INFO2 = 10,

                    /** SEVERITY_NUMBER_INFO3 value */
                    SEVERITY_NUMBER_INFO3 = 11,

                    /** SEVERITY_NUMBER_INFO4 value */
                    SEVERITY_NUMBER_INFO4 = 12,

                    /** SEVERITY_NUMBER_WARN value */
                    SEVERITY_NUMBER_WARN = 13,

                    /** SEVERITY_NUMBER_WARN2 value */
                    SEVERITY_NUMBER_WARN2 = 14,

                    /** SEVERITY_NUMBER_WARN3 value */
                    SEVERITY_NUMBER_WARN3 = 15,

                    /** SEVERITY_NUMBER_WARN4 value */
                    SEVERITY_NUMBER_WARN4 = 16,

                    /** SEVERITY_NUMBER_ERROR value */
                    SEVERITY_NUMBER_ERROR = 17,

                    /** SEVERITY_NUMBER_ERROR2 value */
                    SEVERITY_NUMBER_ERROR2 = 18,

                    /** SEVERITY_NUMBER_ERROR3 value */
                    SEVERITY_NUMBER_ERROR3 = 19,

                    /** SEVERITY_NUMBER_ERROR4 value */
                    SEVERITY_NUMBER_ERROR4 = 20,

                    /** SEVERITY_NUMBER_FATAL value */
                    SEVERITY_NUMBER_FATAL = 21,

                    /** SEVERITY_NUMBER_FATAL2 value */
                    SEVERITY_NUMBER_FATAL2 = 22,

                    /** SEVERITY_NUMBER_FATAL3 value */
                    SEVERITY_NUMBER_FATAL3 = 23,

                    /** SEVERITY_NUMBER_FATAL4 value */
                    SEVERITY_NUMBER_FATAL4 = 24
                }

                /** LogRecordFlags enum. */
                enum LogRecordFlags {

                    /** LOG_RECORD_FLAGS_DO_NOT_USE value */
                    LOG_RECORD_FLAGS_DO_NOT_USE = 0,

                    /** LOG_RECORD_FLAGS_TRACE_FLAGS_MASK value */
                    LOG_RECORD_FLAGS_TRACE_FLAGS_MASK = 255
                }

                /**
                 * Properties of a LogRecord.
                 * @deprecated Use opentelemetry.proto.logs.v1.LogRecord.$Properties instead.
                 */
                interface ILogRecord extends opentelemetry.proto.logs.v1.LogRecord.$Properties {
                }

                /** Represents a LogRecord. */
                class LogRecord {

                    /**
                     * Constructs a new LogRecord.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: opentelemetry.proto.logs.v1.LogRecord.$Properties);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];

                    /** LogRecord timeUnixNano. */
                    timeUnixNano: (number|Long);

                    /** LogRecord observedTimeUnixNano. */
                    observedTimeUnixNano: (number|Long);

                    /** LogRecord severityNumber. */
                    severityNumber: opentelemetry.proto.logs.v1.SeverityNumber;

                    /** LogRecord severityText. */
                    severityText: string;

                    /** LogRecord body. */
                    body?: (opentelemetry.proto.common.v1.AnyValue.$Properties|null);

                    /** LogRecord attributes. */
                    attributes: opentelemetry.proto.common.v1.KeyValue.$Properties[];

                    /** LogRecord droppedAttributesCount. */
                    droppedAttributesCount: number;

                    /** LogRecord flags. */
                    flags: number;

                    /** LogRecord traceId. */
                    traceId: Uint8Array;

                    /** LogRecord spanId. */
                    spanId: Uint8Array;

                    /** LogRecord eventName. */
                    eventName: string;

                    /**
                     * Creates a new LogRecord instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns LogRecord instance
                     */
                    static create(properties: opentelemetry.proto.logs.v1.LogRecord.$Shape): opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape;
                    static create(properties?: opentelemetry.proto.logs.v1.LogRecord.$Properties): opentelemetry.proto.logs.v1.LogRecord;

                    /**
                     * Encodes the specified LogRecord message. Does not implicitly {@link opentelemetry.proto.logs.v1.LogRecord.verify|verify} messages.
                     * @param message LogRecord message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encode(message: opentelemetry.proto.logs.v1.LogRecord.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified LogRecord message, length delimited. Does not implicitly {@link opentelemetry.proto.logs.v1.LogRecord.verify|verify} messages.
                     * @param message LogRecord message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    static encodeDelimited(message: opentelemetry.proto.logs.v1.LogRecord.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a LogRecord message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns {opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape} LogRecord
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape;

                    /**
                     * Decodes a LogRecord message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns {opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape} LogRecord
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): opentelemetry.proto.logs.v1.LogRecord & opentelemetry.proto.logs.v1.LogRecord.$Shape;

                    /**
                     * Verifies a LogRecord message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a LogRecord message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns LogRecord
                     */
                    static fromObject(object: { [k: string]: any }): opentelemetry.proto.logs.v1.LogRecord;

                    /**
                     * Creates a plain object from a LogRecord message. Also converts values to other types if specified.
                     * @param message LogRecord
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    static toObject(message: opentelemetry.proto.logs.v1.LogRecord, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this LogRecord to JSON.
                     * @returns JSON object
                     */
                    toJSON(): { [k: string]: any };

                    /**
                     * Gets the type url for LogRecord
                     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                     * @returns The type url
                     */
                    static getTypeUrl(prefix?: string): string;
                }

                namespace LogRecord {

                    /** Properties of a LogRecord. */
                    interface $Properties {

                        /** LogRecord timeUnixNano */
                        timeUnixNano?: (number|Long|null);

                        /** LogRecord observedTimeUnixNano */
                        observedTimeUnixNano?: (number|Long|null);

                        /** LogRecord severityNumber */
                        severityNumber?: (opentelemetry.proto.logs.v1.SeverityNumber|null);

                        /** LogRecord severityText */
                        severityText?: (string|null);

                        /** LogRecord body */
                        body?: (opentelemetry.proto.common.v1.AnyValue.$Properties|null);

                        /** LogRecord attributes */
                        attributes?: (opentelemetry.proto.common.v1.KeyValue.$Properties[]|null);

                        /** LogRecord droppedAttributesCount */
                        droppedAttributesCount?: (number|null);

                        /** LogRecord flags */
                        flags?: (number|null);

                        /** LogRecord traceId */
                        traceId?: (Uint8Array|null);

                        /** LogRecord spanId */
                        spanId?: (Uint8Array|null);

                        /** LogRecord eventName */
                        eventName?: (string|null);

                        /** Unknown fields preserved while decoding when enabled */
                        $unknowns?: Uint8Array[];
                    }

                    /** Shape of a LogRecord. */
                    type $Shape = {
                      timeUnixNano?: number|Long|null;
                      observedTimeUnixNano?: number|Long|null;
                      severityNumber?: opentelemetry.proto.logs.v1.SeverityNumber|null;
                      severityText?: string|null;
                      body?: opentelemetry.proto.common.v1.AnyValue.$Shape|null;
                      attributes?: opentelemetry.proto.common.v1.KeyValue.$Shape[]|null;
                      droppedAttributesCount?: number|null;
                      flags?: number|null;
                      traceId?: Uint8Array|null;
                      spanId?: Uint8Array|null;
                      eventName?: string|null;
                      $unknowns?: Uint8Array[];
                    };
                }
            }
        }
    }
}
