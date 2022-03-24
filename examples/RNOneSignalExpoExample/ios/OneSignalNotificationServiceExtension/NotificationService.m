#import <OneSignal/OneSignal.h>

#import "NotificationService.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNNotificationRequest *receivedRequest;
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.receivedRequest = request;
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    [OneSignal didReceiveNotificationExtensionRequest:self.receivedRequest
                       withMutableNotificationContent:self.bestAttemptContent
                                   withContentHandler:self.contentHandler];
}

- (void)serviceExtensionTimeWillExpire {
    [OneSignal serviceExtensionTimeWillExpireRequest:self.receivedRequest withMutableNotificationContent:self.bestAttemptContent];
    self.contentHandler(self.bestAttemptContent);
}

@end
