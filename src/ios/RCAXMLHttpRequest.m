//
//  RCAXMLHttpRequest.m
//  Cordova Plugins CORS
//
//  Created by Raphaël Calabro on 12/06/2017.
//
//

#import "RCAXMLHttpRequest.h"

@interface RCAXMLHttpRequest () {
    NSOperationQueue *_queue;
    NSURLSession *_session;
}
@end

@implementation RCAXMLHttpRequest

- (void)pluginInitialize {
    _queue = [[NSOperationQueue alloc] init];
    _session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration] delegate:nil delegateQueue:_queue];
}

- (void)send:(CDVInvokedUrlCommand *)command {
    NSString *method = [command argumentAtIndex:0];
    NSString *path = [command argumentAtIndex:1];
    NSDictionary *headers = [command argumentAtIndex:2];
    NSString *data = [command argumentAtIndex:3];
    
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:path]];
    [request setHTTPMethod:method];
    if (![data isEqual:[NSNull null]]) {
        [request setHTTPBody:[data dataUsingEncoding:NSUTF8StringEncoding]];
    }
    [headers enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSString *obj, BOOL * _Nonnull stop) {
        [request setValue:obj forHTTPHeaderField:key];
    }];
    
    NSURLSessionDataTask *task = [_session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        NSNumber *statusCode = @200;
        NSString *statusText = @"OK";
        NSString *responseText = @"";
        NSDictionary *headers = @{};
        NSString *allHeaders = @"";
        
        if ([response isKindOfClass:NSHTTPURLResponse.class]) {
            NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
            statusCode = [NSNumber numberWithInteger:httpResponse.statusCode];
            statusText = [RCAXMLHttpRequest statusTextForStatusCode:httpResponse.statusCode];
            
            NSDictionary *allHeaderFields = httpResponse.allHeaderFields;
            headers = allHeaderFields;
            
            NSMutableArray *headerArray = [[NSMutableArray alloc] initWithCapacity:allHeaderFields.count];
            [allHeaderFields enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSString *obj, BOOL * _Nonnull stop) {
                [headerArray addObject:[NSString stringWithFormat:@"%@: %@", key, obj]];
            }];
            allHeaders = [headerArray componentsJoinedByString:@"\r\n"];
        }
        
        NSStringEncoding encoding = NSUTF8StringEncoding;
        if (response.textEncodingName != nil) {
            encoding = CFStringConvertEncodingToNSStringEncoding(CFStringConvertIANACharSetNameToEncoding((CFStringRef)response.textEncodingName));
        }
        responseText = [[NSString alloc] initWithData:data encoding:encoding];
        
        [self.commandDelegate sendPluginResult:
         [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                       messageAsDictionary:@{
                                             @"status": statusCode,
                                             @"statusText": statusText,
                                             @"responseText": responseText,
                                             @"responseHeaders": headers,
                                             @"allResponseHeaders": allHeaders
                                             }] callbackId:command.callbackId];
    }];
    [task resume];
}

+ (NSString *)statusTextForStatusCode:(NSInteger)statusCode {
    switch (statusCode) {
        case 100:
            return @"Continue";
        case 101:
            return @"Switching Protocols";
        case 200:
            return @"OK";
        case 201:
            return @"Created";
        case 202:
            return @"Accepted";
        case 203:
            return @"Non-Authoritative Information";
        case 204:
            return @"No Content";
        case 205:
            return @"Reset Content";
        case 300:
            return @"Multiple Choices";
        case 301:
            return @"Moved Permanently";
        case 400:
            return @"Bad Request";
        case 401:
            return @"Unauthorized";
        case 402:
            return @"Payment Required";
        case 403:
            return @"Forbidden";
        case 404:
            return @"Not Found";
        case 405:
            return @"Method Not Allowed";
        case 406:
            return @"Not Acceptable";
        case 407:
            return @"Proxy Authentication Required";
        case 408:
            return @"Request Timeout";
        case 500:
            return @"Internal Server Error";
        default:
            return @"Unknown status code";
    }
}

@end
