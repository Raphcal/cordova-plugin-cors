//
//  Tests.m
//  Tests
//
//  Created by Raphaël Calabro on 28/10/2020.
//

#import <XCTest/XCTest.h>
#import <Cordova/CDV.h>
#import "RCAXMLHttpRequest.h"

@interface Tests : XCTestCase
@end

@interface DummyDelegate : NSObject <CDVCommandDelegate>
@property (nonatomic) CDVPluginResult *lastResult;
@property (nonatomic) NSString *lastCallbackId;
@property (nonatomic) void (^block)(DummyDelegate *self);
@end

@implementation Tests

- (void)testExample {
    XCTestExpectation *expectation = [[XCTestExpectation alloc] initWithDescription:@"It should request PingBack"];
    DummyDelegate *commandDelegate = [[DummyDelegate alloc] init];

    RCAXMLHttpRequest *plugin = [[RCAXMLHttpRequest alloc] init];
    plugin.commandDelegate = commandDelegate;
    [plugin pluginInitialize];
    CDVInvokedUrlCommand *command = [[CDVInvokedUrlCommand alloc] initWithArguments:@[
        @"GET",
        @"http://daeke.online.fr/pingBack.php",
        @{},
        [NSNull null]
    ] callbackId:@"callbackid" className:@"RCAXMLHttpRequest" methodName:@"send"];
    [plugin send:command];

    commandDelegate.block = ^(DummyDelegate *self) {
        XCTAssertEqual(@"callbackid", self.lastCallbackId);
        XCTAssertNotNil(self.lastResult);
        [expectation fulfill];
    };

    [self waitForExpectations:@[expectation] timeout:3];
}


@end

@implementation DummyDelegate

- (void)sendPluginResult:(CDVPluginResult *)result callbackId:(NSString *)callbackId {
    self.lastResult = result;
    self.lastCallbackId = callbackId;
    self.block(self);
}

- (void)evalJs:(NSString *)js {
}


- (void)evalJs:(NSString *)js scheduledOnRunLoop:(BOOL)scheduledOnRunLoop {
}


- (id)getCommandInstance:(NSString *)pluginName {
    return nil;
}


- (NSString *)pathForResource:(NSString *)resourcepath {
    return nil;
}


- (void)runInBackground:(void (^)(void))block {
}


- (NSString *)userAgent {
    return nil;
}


@synthesize settings;

@synthesize urlTransformer;

@end
