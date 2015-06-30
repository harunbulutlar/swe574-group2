# Introduction #

Add your content here.


# Test Cases #

| **Case ID** | **Use Case Name** | **Scenario** | **Test Step** | **Expected Result** | **Actual Outcome** | **Status** |
|:------------|:------------------|:-------------|:--------------|:--------------------|:-------------------|:-----------|
|TC08001      |Search             |Search one word text|               |Retrieve at least 10 items related with search text|                    |Open        |
|TC08002      |Search             |Search text includes numbers|               |System consider numeric values in search|                    |Open        |
|TC08003      |Search             |Search for empty text|               |Display the recent items|                    |Open        |
|TC08004      |Search             |Search for meaningless text|               |Retrieve nothing     |                    |Open        |
|TC08005      |Search             |Search for outdated item|               |Retrieve at the end of search list|                    |Open        |
|TC09001      |View Group         |Visit any group's web page|               |Design is as described in RSD|                    |Open        |
|TC09002      |View Group         |Access group directly with URL|               |Should work asif a clicking a link|                    |Open        |
|TC09003      |View Group         |Access group directly with URL but not allowed|               |Does not allow to enter|                    |Open        |
|TC10001      |Add Group Comment  |Enter a clean comment (short alphanumeric sentence)|               |Accepts comment, immediate at the top of recent comments|                    |Open        |
|TC10002      |Add Group Comment  |Enter a comment with emotion characters|               |Accepts comment, immediate at the top of recent comments|                    |Open        |
|TC10003      |Add Group Comment  |Enter empty comment|               |Do nothing           |                    |Open        |
|TC10004      |Add Group Comment  |Enter extreme text (at least 10000 words) comment|               |Limit comment as defined in RSD|                    |Open        |
|TC11001      |Join Group Request |Send a regular join request|               |Should be listed in group owner notification area|                    |Open        |
|TC11002      |Join Group Request |Send a regular join request via link several|               |Just allow the first one. Disregard others|                    |Open        |
|TC11003      |Join Group Request |Join a group that belengs to current user|               |There is no such link|                    |Open        |
|TC12001      |Group Owner Approval / Rejection|Accept a group join request|               |Requester user can see group details|                    |Open        |
|TC12002      |Group Owner Approval / Rejection|Reject a group join request|               |Requester user can not see group details|                    |Open        |
|TC12003      |Group Owner Approval / Rejection|Accept or reject after old link where already completed|               |System replies as it already answered|                    |Open        |
|TC13001      |Post Comment to Groups|Post a regular comment |               |Seen immediately groups page|                    |Open        |
|TC13002      |Post Comment to Groups|Post a comment with Turkish charecters and wildcards|               |System accepts any typed input|                    |Open        |
|TC13003      |Post Comment to Groups|Post an empty comment|               |Do nothing           |                    |Open        |
|TC13004      |Post Comment to Groups|Post extremely long comment|               |Ask user to keep the length below limit|                    |Open        |
|TC18001      |View a Poll        |Visit a poll's web page|               |Poll design is as described in RSD|                    |Open        |
|TC18002      |View a Poll        |Access poll page directly with URL|               |Should work asif a clicking a link|                    |Open        |
|TC18003      |View a Poll        |Access via link directly with URL but not allowed|               |Does not allow to enter|                    |Open        |
|TC18004      |View a Poll        |Try to vote which is already done|               |Forward to poll's web page|                    |Open        |
|TC19001      |Vote for a Poll    |Vote normally |               |Accept votes and updates database|                    |Open        |
|TC19002      |Vote for a Poll    |Submit without a vote |               |Give warning to select an option|                    |Open        |
|TC19003      |Vote for a Poll    |Try to vote more than one option|               |Give warning to select one option|                    |Open        |
|TC24001      |Create a Group     |Create a group|               |Group is created and can be visited|                    |Open        |
|TC24002      |Create a Group     |Try to create a group without name or user restrictions|               |Warn user to enter required details|                    |Open        |
|TC24003      |Create a Group     |Create a group with details are the same with an existing group|               |Create group         |                    |Open        |
|TC24004      |Create a Group     |Create Group with name includes with wildcard chars. |               |Warn user to enter alphanumeric characters|                    |Open        |
|TC25001      |Create a Poll      |Create a poll with 3-4 vote options|               |Should be votable    |                    |Open        |
|TC25002      |Create a Poll      |Create a poll with 0 and 1 options|               |System should allow to submit|                    |Open        |
|TC25003      |Create a Poll      |Create a poll without description|               |System should allow to submit|                    |Open        |
|TC01001      |User Registration Validation |Grant user to use system|               |User Successfully can log in|                    |Open        |
|TC01002      |User Registration Validation |Decline user registration|               |User Successfully do not allow to login system and email send to user|                    |Open        |
|TC02001      |Delete Groups / Polls / Events / Posts / Comments|Delet an item (group, poll, event, post, comment)|               |Item is not displayed in system anymore. Inform user about the deletion|                    |Open        |
|TC02002      |Delete Groups / Polls / Events / Posts / Comments|Delete an item while someone is using it|               |User submission are not allowed and inform about deletion then forward his/her homepage|                    |Open        |
|TC03001      |Remove Member      |Remove a user |               |User can not be login anymore|                    |Open        |
|TC03002      |Remove Member      |Remove a user who created an item (group, event, etc)|               |The items user created are removed with the user|                    |Open        |
|TC03003      |Remove Member      |Remove a user who has pending issues such as group admissions|               |The items user created are removed with the user|                    |Open        |
|TC04001      |Remove Place / Edit Place|Remove a place|               |Item is not displayed in system anymore. Inform user about the deletion|                    |Open        |
|TC04002      |Remove Place / Edit Place|Remove a place while someone is visiting its page|               |User submission are not allowed and inform about deletion then forward his/her homepage|                    |Open        |
|TC04003      |Remove Place / Edit Place|Edit a place details|               |Changes are activated immediately. Owner also updated about the edit|                    |Open        |