//
//  UIKit.m
//  Cordova macOs
//
//  Created by Raphaël Calabro on 30/12/2020.
//

#import "UIKit.h"

@implementation UIDevice

+ (UIDevice *)currentDevice {
    return [[UIDevice alloc] init];
}

@end

@implementation UIApplication

+ (UIApplication *)sharedApplication {
    return [[UIApplication alloc] init];
}

@end

@implementation UIWindow
@end

@implementation UIImage

+ (UIImage *)imageNamed:(NSString *)name {
    return [[UIImage alloc] init];
}

@end

@implementation UIColor

+ (UIColor *)colorWithRed:(CGFloat)red green:(CGFloat)green blue:(CGFloat)blue alpha:(CGFloat)alpha {
    return [[UIColor alloc] init];
}

@end

@implementation UIView

- (void)addSubview:(UIView *)view {}
- (void)sendSubviewToBack:(UIView *)view {}
- (void)removeFromSuperview {}

@end

@implementation UIViewController

- (id)initWithNibName:(NSString *)nibName bundle:(NSBundle *)nibBundleOrNil {
    self = [super init];
    return self;
}
- (id)initWithCoder:(NSCoder*)aDecoder {
    self = [super init];
    return self;
}

- (void)viewDidLoad {}

- (void)viewWillAppear:(BOOL)animated {}
- (void)viewDidAppear:(BOOL)animated  {}
- (void)viewWillDisappear:(BOOL)animated {}
- (void)viewDidDisappear:(BOOL)animated {}
- (void)viewWillLayoutSubviews {}
- (void)viewDidLayoutSubviews {}
- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator {}
- (void)didReceiveMemoryWarning {}

@end

@implementation UIScrollView
@end

@implementation UILongPressGestureRecognizer
@end
