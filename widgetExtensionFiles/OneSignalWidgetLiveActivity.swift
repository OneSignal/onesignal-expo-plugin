// This default Live Activity widget uses OneSignal's `DefaultLiveActivityAttributes`
// so you can drive it entirely from JS via `OneSignal.LiveActivities.setupDefault()`.
// To use a custom attributes type, replace this file via the plugin's
// `liveActivities.widgetFilePath` prop.
//
// See: https://documentation.onesignal.com/docs/cross-platform-live-activity-setup

import ActivityKit
import WidgetKit
import SwiftUI
import OneSignalLiveActivities

struct OneSignalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DefaultLiveActivityAttributes.self) { context in
            // Lock screen / banner UI
            VStack {
                Spacer()

                Text("Title: " + (context.attributes.data["title"]?.asString() ?? ""))
                    .font(.headline)

                Spacer()

                HStack {
                    Spacer()
                    Text(context.state.data["message"]?.asDict()?["en"]?.asString() ?? "Default Message")
                    Spacer()
                }

                Spacer()
            }
            .activitySystemActionForegroundColor(.black)
            .activityBackgroundTint(.white)

        } dynamicIsland: { _ in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom")
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T")
            } minimal: {
                Text("Min")
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}
