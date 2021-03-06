var React = require('react')
var RequestGraph = require('./RequestGraph.jsx')
var Constants = require('../lib/constants.js')

var MonitorPanel = React.createClass({
    getCircuitStatus: function() {
        if(this.props.data.circuitBreaker_forcedOpen) {
            return <span className="status-value status-forced-open">Forced Open</span>
        }

        if(this.props.data.circuitBreaker_forcedClosed) {
            return <span className="status-value status-forced-closed">Forced Closed</span>
        }

        // This value defaults to a boolean but then gets set as an object in clustered mode
        // if some hosts are open.  This is stupid, but whatever.
        var circuitStatus = this.props.data.circuitBreaker_open
        if(circuitStatus === false) {
            return <span className="status-value status-closed">Closed</span>
        }

        if(circuitStatus === true) {
            return <span className="status-value status-open">Open</span>
        }

        var openPercentage = (this.props.data.circuitBreaker_open["true"] / this.props.data.reportingHosts) * 100

        return <span className="status-value status-partial-open">Open ({openPercentage}%)</span>
    },
    getCircuitBreaker: function() {
        var rejectedCount = this.props.data.rollingCountThreadPoolRejected
        if(this.props.data.execution_isolationStrategy == 'SEMAPHORE') {
            rejectedCount = this.props.data.rollingCountSemaphoreRejected
        }

        return (
            <div className="monitor-panel monitor-panel-circuit-breaker">
                <RequestGraph rateLine={true} data={this.props.data} />
                <div className="counter-overlay">
                    <p className="monitor-name text-right">{this.props.data.name}</p>
                    <div className="vertical-columns">
                        <div className="cell">
                            <span className="line line-large legend legend_error_percentage">{this.props.data.errorPercentage}%</span>
                        </div>
                        <div className="cell separate">
                            <span className="line legend legend_timeout">{this.props.data.rollingCountTimeout}</span>
                            <span className="line legend legend_rejected">{rejectedCount}</span>
                            <span className="line legend legend_failure">{this.props.data.rollingCountFailure}</span>
                        </div>
                        <div className="cell separate">
                            <span className="line legend legend_success">{this.props.data.rollingCountSuccess}</span>
                            <span className="line legend legend_short_circuited">{this.props.data.rollingCountShortCircuited}</span>
                            <span className="line legend legend_bad_request">{this.props.data.rollingCountBadRequests}</span>
                        </div>
                        <br className="clear" />
                        <br />
                    </div>
                    <div className="rate">
                        <span className="rate-label">Host: </span>
                        <span className="rate-value">{this.props.data.ratePerSecondPerHost}/s</span>
                    </div>
                    <div className="rate">
                        <span className="rate-label">Cluster: </span>
                        <span className="rate-value">{this.props.data.ratePerSecond}/s</span>
                    </div>
                    <div className="status">
                        <span className="status-label">Circuit </span>
                        {this.getCircuitStatus()}
                    </div>

                    <br />

                    <div className="values-table">
                        <div className="values-row">
                            <div className="values-cell values-label">Hosts</div>
                            <div className="values-cell values-value">{this.props.data.reportingHosts}</div>
                            <div className="values-cell values-label">95th</div>
                            <div className="values-cell values-value">{this.props.data.latencyExecute['95']}ms</div>
                        </div>
                        <div className="values-row">
                            <div className="values-cell values-label">Median</div>
                            <div className="values-cell values-value">{this.props.data.latencyExecute['50']}ms</div>
                            <div className="values-cell values-label">99th</div>
                            <div className="values-cell values-value">{this.props.data.latencyExecute['99']}ms</div>
                        </div>
                        <div className="values-row">
                            <div className="values-cell values-label">Mean</div>
                            <div className="values-cell values-value">{this.props.data.latencyExecute_mean}ms</div>
                            <div className="values-cell values-label">99.5th</div>
                            <div className="values-cell values-value">{this.props.data.latencyExecute['99.5']}ms</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    getThreadPool: function() {
        var rejectedCount = this.props.data.rollingCountThreadPoolRejected
        if(this.props.data.execution_isolationStrategy == 'SEMAPHORE') {
            rejectedCount = this.props.data.rollingCountSemaphoreRejected
        }

        return (
            <div className="monitor-panel monitor-panel-thread-pool">
                <RequestGraph rateLine={false} data={this.props.data} />
                <div className="counter-overlay">
                    <p className="monitor-name text-right">{this.props.data.name}</p>
                    <div className="rate">
                        <span className="rate-label">Host: </span>
                        <span className="rate-value">{this.props.data.ratePerSecondPerHost}/s</span>
                    </div>
                    <div className="rate">
                        <span className="rate-label">Cluster: </span>
                        <span className="rate-value">{this.props.data.ratePerSecond}/s</span>
                    </div>

                    <br />
                    <br />

                    <div className="values-table">
                        <div className="values-row">
                            <div className="values-cell values-label">Active</div>
                            <div className="values-cell values-value">{this.props.data.currentActiveCount}</div>
                            <div className="values-cell values-label wide">Max Active</div>
                            <div className="values-cell values-value short">{this.props.data.rollingMaxActiveThreads}</div>
                        </div>
                        <div className="values-row">
                            <div className="values-cell values-label">Queued</div>
                            <div className="values-cell values-value">{this.props.data.currentQueueSize}</div>
                            <div className="values-cell values-label wide">Executions</div>
                            <div className="values-cell values-value short">{this.props.data.rollingCountThreadsExecuted}</div>
                        </div>
                        <div className="values-row">
                            <div className="values-cell values-label">Pool Size</div>
                            <div className="values-cell values-value">{this.props.data.currentPoolSize}</div>
                            <div className="values-cell values-label wide">Queue Size</div>
                            <div className="values-cell values-value short">{this.props.data.propertyValue_queueSizeRejectionThreshold}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    render: function() {
        if (this.props.type == Constants.HystrixCommandType) {
            return this.getCircuitBreaker()
        }

        if(this.props.type == Constants.HystrixThreadPoolType) {
            return this.getThreadPool()
        }

        return null
    }
})

module.exports = MonitorPanel
