[{
	"resource": "/C:/Users/RogStrix/Desktop/root-repo/backend/src/routes/pdf/invoicePdf.ts",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "Type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>) => Promise<...>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.\n  Type 'Promise<Response<any, Record<string, any>, number> | undefined>' is not assignable to type 'void | Promise<void>'.\n    Type 'Promise<Response<any, Record<string, any>, number> | undefined>' is not assignable to type 'Promise<void>'.\n      Type 'Response<any, Record<string, any>, number> | undefined' is not assignable to type 'void'.\n        Type 'Response<any, Record<string, any>, number>' is not assignable to type 'void'.",
	"source": "ts",
	"startLineNumber": 125,
	"startColumn": 7,
	"endLineNumber": 125,
	"endColumn": 20,
	"origin": "extHost1"
}]