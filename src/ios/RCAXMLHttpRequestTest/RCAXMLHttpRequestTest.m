//
//  RCAXMLHttpRequestTest.m
//  RCAXMLHttpRequestTest
//
//  Created by Raphaël Calabro on 20/12/2020.
//

#import <XCTest/XCTest.h>
#import <Cordova/CDV.h>
//#import <RCAXMLHttpRequest/RCAXMLHttpRequest.h>
#import "RCAXMLHttpRequest.h"

@interface RCAXMLHttpRequestTest : XCTestCase
@end

@interface RCACommandeDelegate : NSObject<CDVCommandDelegate>

@property (nonatomic, readonly) NSDictionary* settings;
@property (nonatomic, copy) UrlTransformerBlock urlTransformer;

@property (readonly) XCTestExpectation *expectation;
@property (nonatomic, strong) CDVPluginResult *lastResult;
@property (nonatomic, strong) NSString *lastCallbackId;

@end

@implementation RCAXMLHttpRequestTest

- (void)testShouldFetchAPDFFile {
    NSString *expectedCallbackId = @"toto";

    RCACommandeDelegate *delegate = [[RCACommandeDelegate alloc] init];

    RCAXMLHttpRequest *xhr = [[RCAXMLHttpRequest alloc] init];
    xhr.commandDelegate = delegate;
    [xhr pluginInitialize];
    CDVInvokedUrlCommand *command = [[CDVInvokedUrlCommand alloc] initWithArguments:@[
        @"GET",
        @"http://daeke.online.fr/FI2-050328-Partiels.pdf",
        @{},
        [NSNull null],
        @"text"
    ] callbackId:expectedCallbackId className:@"RCAXMLHttpRequest" methodName:@"send"];
    [xhr send:command];

    [self waitForExpectations:@[delegate.expectation] timeout:5.0];
    XCTAssertEqual(expectedCallbackId, delegate.lastCallbackId, @"Callback id should be '%@' but was '%@'", expectedCallbackId, delegate.lastCallbackId);

    NSDictionary *result = delegate.lastResult.message;
    XCTAssertNotNil(result, @"Result should be returned as a dictionary and should not be nil.");

    NSString *responseText = [result objectForKey:@"responseText"];
    XCTAssertNotNil(responseText, @"responseText should not be nil.");

    XCTAssertEqual([NSNull null], [result objectForKey:@"response"], @"response should be null because responseType is text.");
}

- (void)testShouldReturnResponseAsJSONArrayWhenResponseTypeIsArraybuffer {
    NSString *expectedCallbackId = @"toto";

    RCACommandeDelegate *delegate = [[RCACommandeDelegate alloc] init];

    RCAXMLHttpRequest *xhr = [[RCAXMLHttpRequest alloc] init];
    xhr.commandDelegate = delegate;
    [xhr pluginInitialize];
    CDVInvokedUrlCommand *command = [[CDVInvokedUrlCommand alloc] initWithArguments:@[
        @"GET",
        @"http://daeke.online.fr/tcm/img/clear.png",
        @{},
        [NSNull null],
        @"arraybuffer"
    ] callbackId:expectedCallbackId className:@"RCAXMLHttpRequest" methodName:@"send"];
    [xhr send:command];

    [self waitForExpectations:@[delegate.expectation] timeout:5.0];
    XCTAssertEqual(expectedCallbackId, delegate.lastCallbackId, @"Callback id should be '%@' but was '%@'", expectedCallbackId, delegate.lastCallbackId);

    NSDictionary *result = delegate.lastResult.message;
    XCTAssertNotNil(result, @"Result should be returned as a dictionary and should not be nil.");

    XCTAssertEqual([NSNull null], [result objectForKey:@"responseText"], @"responseText should be null because responseType is arraybuffer.");

    NSString *response = [result objectForKey:@"response"];
    XCTAssertTrue([response isEqualToString:@"[137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,2,0,0,0,2,8,3,0,0,0,69,104,253,22,0,0,0,7,116,73,77,69,7,212,9,1,10,18,25,225,223,172,72,0,0,0,9,112,72,89,115,0,0,30,193,0,0,30,193,1,195,105,84,83,0,0,0,4,103,65,77,65,0,0,177,143,11,252,97,5,0,0,0,3,80,76,84,69,0,0,0,167,122,61,218,0,0,0,1,116,82,78,83,0,64,230,216,102,0,0,0,11,73,68,65,84,120,218,99,96,0,1,0,0,6,0,1,109,40,16,47,0,0,0,0,73,69,78,68,174,66,96,130]"], @"responseText should contain binary data as a JSON array but was: %@", response);
}

@end

@implementation RCACommandeDelegate {
    XCTestExpectation *_expectation;
}

- (id)init {
    self = [super init];
    if (self) {
        _expectation = [[XCTestExpectation alloc] initWithDescription:@"Waiting for plugin result"];
    }
    return self;
}

- (NSString*)pathForResource:(NSString*)resourcepath {
    return nil;
}
- (id)getCommandInstance:(NSString*)pluginName {
    return nil;
}

- (void)sendPluginResult:(CDVPluginResult*)result callbackId:(NSString*)callbackId {
    _lastResult = result;
    _lastCallbackId = callbackId;
    [_expectation fulfill];
}

- (void)evalJs:(NSString*)js {}
- (void)evalJs:(NSString*)js scheduledOnRunLoop:(BOOL)scheduledOnRunLoop {}
- (void)runInBackground:(void (^)(void))block {}
- (NSString*)userAgent {
    return @"user-agent";
}

@end
