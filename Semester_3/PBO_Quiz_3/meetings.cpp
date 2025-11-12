#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <set>
#include <iomanip> // Not strictly needed, but good practice

using namespace std;

// A struct to hold meeting details
struct Meeting {
    int start;
    int end;
    int id;
};

// Comparison function for sorting meetings by their end time
bool compareMeetings(const Meeting& a, const Meeting& b) {
    if (a.end != b.end) {
        return a.end < b.end;
    }
    // If end times are the same, secondary sort (e.g., by start) can help
    // but isn't strictly necessary for correctness of the *count*.
    return a.start < b.start;
}

int main() {
    // Optimize C++ I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int d;
    cin >> d;

    while (d--) {
        int r, m;
        cin >> r >> m;

        vector<Meeting> meetings(m);
        for (int i = 0; i < m; ++i) {
            int bh, bm, eh, em;
            char colon;
            cin >> bh >> colon >> bm >> eh >> colon >> em;
            
            meetings[i].start = bh * 60 + bm;
            meetings[i].end = eh * 60 + em;
            meetings[i].id = i + 1; // 1-based indexing
        }

        // 1. Sort all meetings by end time
        sort(meetings.begin(), meetings.end(), compareMeetings);

        // 2. Data structure to track room availability
        // We store {finish_time, room_index}
        // Using multiset in case multiple rooms finish at the same time
        multiset<pair<int, int>> room_availability;
        for (int i = 0; i < r; ++i) {
            room_availability.insert({0, i}); // All rooms are free at time 0
        }

        // 3. Vector of vectors to store the final assignments
        vector<vector<int>> assignments(r);
        int total_scheduled = 0;

        // 4. Iterate through sorted meetings and assign
        for (const auto& meeting : meetings) {
            // Find a room that is free at or before meeting.start
            // We want the room with the latest finish time <= meeting.start
            
            // upper_bound finds the first element *greater than* the key.
            // We use {meeting.start, 2e9} as a key to search.
            // 2e9 is just a very large number (larger than any room_id).
            auto it = room_availability.upper_bound({meeting.start, 2000000});

            // If it == begin(), no room is available (all rooms finish *after* start)
            if (it == room_availability.begin()) {
                continue; // Cannot schedule this meeting
            }

            // Otherwise, decrement the iterator to get the best-fit room
            --it;

            // This is the room we'll use
            int room_index = it->second;
            
            // "Schedule" the meeting
            // Erase the old entry and insert the new one
            room_availability.erase(it);
            room_availability.insert({meeting.end, room_index});

            // Store the assignment
            assignments[room_index].push_back(meeting.id);
            total_scheduled++;
        }

        // 5. Print the results for this day
        cout << total_scheduled << "\n";
        for (int i = 0; i < r; ++i) {
            if (!assignments[i].empty()) {
                for (int j = 0; j < assignments[i].size(); ++j) {
                    cout << assignments[i][j] << (j == assignments[i].size() - 1 ? "" : " ");
                }
                cout << "\n";
            }
        }

        // Separate days with a blank line
        cout << "\n";
    }

    return 0;
}
