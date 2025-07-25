// src/middleware/tracer-provider.js
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
//instrumentations
import { ExpressInstrumentation }   from "opentelemetry-instrumentation-express";
// const { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { HttpInstrumentation }      from "@opentelemetry/instrumentation-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { appConfig } from "../configs/env.js";
// Configuration du fournisseur de traçage
const provider = new NodeTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: "smp-ussp-service",
    }),
});

let otlpExporter = {}
if (process.env.OTL_TRACE_DEFAULT_PROTOCOL === 'grpc') {
    otlpExporter = new OTLPTracerExportGRPC({
        serviceName: appConfig.componentName,
        url: process.env.OTL_EXPORTER_COLLECTOR_HOST // URL du collecteur 
    });

} else {
     
    otlpExporter = new OTLPTracerExportHTTP({
        hostname: appConfig.componentName,
        url: process.env.OTL_EXPORTER_COLLECTOR_HOST // URL du collecteur 
    });

}
// Configuration de l'exportateur OTLP
provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

provider.register();

function instrumentationsRegistration(options = {}) {
    if (options && options.instrumentations && Array.isArray(options.instrumentations)) {
        options.instrumentations.push(new HttpInstrumentation())
        options.instrumentations.push(new ExpressInstrumentation())
        registerInstrumentations(...options, ...{
            tracerProvider: provider,
        });
    } else {
        registerInstrumentations({
            ...options, ...{
                instrumentations: [
                    new HttpInstrumentation(),
                    new ExpressInstrumentation(),
                    // new MongoDBInstrumentation(),
                ],
                tracerProvider: provider,
            }
        });
    }
}
export { instrumentationsRegistration  }