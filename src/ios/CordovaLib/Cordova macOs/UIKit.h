//
//  UIKit.h
//  CordovaLib
//
//  Created by Raphaël Calabro on 30/12/2020.
//

#ifndef UIKit_h
#define UIKit_h

@interface UIDevice : NSObject

+ (UIDevice *)currentDevice;
@property (nonatomic, strong) NSString *systemVersion;
@property (nonatomic, strong) NSString *model;
@property (nonatomic) BOOL multitaskingSupported;

@end

@protocol UIApplicationDelegate <NSObject>
@end

@interface UIApplication : NSObject
+ (UIApplication *)sharedApplication;
@property (nonatomic, strong) id<UIApplicationDelegate> delegate;
@end

@interface UIWindow : NSObject
@end

@interface UIImage : NSObject
+ (UIImage *)imageNamed:(NSString *)name;
@end

@interface UIColor : NSObject
+ (UIColor *)colorWithRed:(CGFloat)red green:(CGFloat)green blue:(CGFloat)blue alpha:(CGFloat)alpha;
@end

typedef enum : NSUInteger {
    UIInterfaceOrientationPortrait = 1,
    UIInterfaceOrientationLandscapeLeft = 2,
    UIInterfaceOrientationLandscapeRight = 4,
    UIInterfaceOrientationPortraitUpsideDown = 8
} UIInterfaceOrientation;

typedef enum : NSUInteger {
    UIViewAutoresizingFlexibleWidth = 1,
    UIViewAutoresizingFlexibleHeight = 2
} UIViewAutoresizing;

@protocol UIViewControllerTransitionCoordinator <NSObject>
@end

@interface UIView : NSObject
@property (nonatomic, strong) UIColor *backgroundColor;
@property (nonatomic) CGRect bounds;
@property (nonatomic) CGRect frame;
@property (nonatomic) UIViewAutoresizing autoresizingMask;

- (void)addSubview:(UIView *)view;
- (void)sendSubviewToBack:(UIView *)view;
- (void)removeFromSuperview;
@end

@interface UIViewController : NSObject

@property (nonatomic, strong) UIView *view;

- (id)initWithNibName:(NSString *)nibName bundle:(NSBundle *)nibBundleOrNil;
- (id)initWithCoder:(NSCoder*)aDecoder;
- (void)viewDidLoad;
- (void)viewWillAppear:(BOOL)animated;
- (void)viewDidAppear:(BOOL)animated;
- (void)viewWillDisappear:(BOOL)animated;
- (void)viewDidDisappear:(BOOL)animated;
- (void)viewWillLayoutSubviews;
- (void)viewDidLayoutSubviews;
- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator;
- (void)didReceiveMemoryWarning;
@end

@interface UIScrollView : NSObject
@end

@protocol UIWebViewDelegate <NSObject>
@end

@interface UILongPressGestureRecognizer : NSObject
@end

#endif /* UIKit_h */
