# quorum-distributed-storage
A fault-tolerant storage system that relies on a quorum-like protocol with physical clocks to ensure consistency for all reads. 

Supports both MongoDB and in-memory storage of data.

To run:
* Modify the config file (example file provided). Fairly straightforward - simply specify the the host and port of each replica
 * read_quorum + write_quorum > total number of replicas
 * write_quorum > 0.5 x total number of replicas
* On each replica, type "node main.js <current_node_id> <port> <mongodb_host> <mongodb_port>"
 * Note that the <current_node_id> corresponds with an ID specified in the config file
 * The MongoDB host and port are optional - if you leave them blank, the system will default to in-memory storage

Using the API:
* Reading from storage
 * Make GET request to /read?<key>
 * Output format: { "result" : <value> }
* Writing to storage
 * Make POST request to /write
 * POST body should be in following JSON format: { "key" : <key>, "value" : <value> }
 * Remember to update headers - Content-Type: application/json
