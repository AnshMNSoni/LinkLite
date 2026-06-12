#!/usr/bin/env python3
import argparse
import time
import httpx
import statistics
import sys

def main():
    parser = argparse.ArgumentParser(description="LinkLite Redirect Lookup Latency Benchmarker")
    parser.add_argument("url", help="The short URL to benchmark (e.g., http://localhost:8000/xyz)")
    parser.add_argument("-n", "--requests", type=int, default=100, help="Number of requests to send (default: 100)")
    parser.add_argument(
        "--flush-each", 
        action="store_true", 
        help="Flush Redis before EACH request to force pure PostgreSQL cold lookups (requires 'redis' package on host)"
    )
    parser.add_argument(
        "--redis-host", 
        default="localhost", 
        help="Redis host (default: localhost) for flushing cache"
    )
    parser.add_argument(
        "--redis-port", 
        type=int, 
        default=6379, 
        help="Redis port (default: 6379) for flushing cache"
    )
    args = parser.parse_args()

    url = args.url
    n_requests = args.requests

    # Set up Redis connection if --flush-each is requested
    redis_client = None
    if args.flush_each:
        try:
            import redis
            redis_client = redis.Redis(host=args.redis_host, port=args.redis_port, decode_responses=True)
            # Test connection
            redis_client.ping()
        except ImportError:
            print("Error: The 'redis' library is required when using --flush-each.")
            print("Please install it via: pip install redis")
            sys.exit(1)
        except Exception as e:
            print(f"Error connecting to Redis at {args.redis_host}:{args.redis_port}: {e}")
            sys.exit(1)

    print(f"Benchmarking redirect lookup on: {url}")
    if args.flush_each:
        print(f"Running in PURE COLD LOOKUP mode (flushing Redis before each request)...")
    else:
        print(f"Sending {n_requests} sequential requests (follow_redirects=False)...")
        print("Note: The 1st request will be cold (Postgres), subsequent requests will be warm (Redis).")
    print("-" * 60)

    latencies = []
    
    # We use httpx.Client to reuse the TCP connection (keep-alive).
    # Reusing the TCP connection is crucial because recreating connections on every request
    # would measure TCP handshake/TLS setup overhead rather than the application lookup latency.
    with httpx.Client(follow_redirects=False) as client:
        for i in range(1, n_requests + 1):
            if args.flush_each and redis_client:
                redis_client.flushall()
                
            try:
                start_time = time.perf_counter()
                response = client.get(url)
                duration = (time.perf_counter() - start_time) * 1000  # Convert to ms
                
                # Verify that it is indeed a redirect (3xx) response
                if i == 1 and response.status_code not in (301, 302, 307, 308):
                    print(f"Warning: Expected a redirect status code (3xx), got {response.status_code}")
                
                latencies.append(duration)
                
                # Show individual progress for the first few and periodically
                if i <= 5 or i % 10 == 0 or i == n_requests:
                    flush_str = " (Flushed Redis)" if args.flush_each else ""
                    print(f"  Request {i:03d}: {duration:6.2f} ms{flush_str}")
                    
            except Exception as e:
                print(f"Error during request {i}: {e}")
                break

    if len(latencies) == 0:
        print("No successful requests were completed.")
        return

    print("-" * 60)
    print("BENCHMARK RESULTS SUMMARY")
    print("-" * 60)
    
    if args.flush_each:
        # All requests were cold
        print(f"Scenario: PostgreSQL Cold Lookups ({len(latencies)} requests)")
        print(f"  - Average Latency: {statistics.mean(latencies):.2f} ms")
        print(f"  - Median Latency:  {statistics.median(latencies):.2f} ms")
        print(f"  - Min Latency:     {min(latencies):.2f} ms")
        print(f"  - Max Latency:     {max(latencies):.2f} ms")
    else:
        # First was cold, rest were warm
        first_latency = latencies[0]
        subsequent = latencies[1:]
        
        print(f"Total Requests: {len(latencies)}")
        print(f"First Request (PostgreSQL Cold Lookup / Cache Miss): {first_latency:.2f} ms")
        
        if subsequent:
            print(f"Subsequent Requests (Redis Cache Hits - {len(subsequent)} requests):")
            print(f"  - Average Latency: {statistics.mean(subsequent):.2f} ms")
            print(f"  - Median Latency:  {statistics.median(subsequent):.2f} ms")
            print(f"  - Min Latency:     {min(subsequent):.2f} ms")
            print(f"  - Max Latency:     {max(subsequent):.2f} ms")
            
            difference_factor = first_latency / statistics.mean(subsequent) if statistics.mean(subsequent) > 0 else 0
            print(f"Speedup Factor (Redis vs PostgreSQL): {difference_factor:.1f}x faster")
        else:
            print("No subsequent requests to compare.")
            
    print("-" * 60)

if __name__ == "__main__":
    main()
