#!/usr/bin/env python3
"""
Mikon OSS Backend API Testing Suite
Tests all backend endpoints for the Business Intelligence platform
"""

import requests
import sys
import json
from datetime import datetime

class MikonOSSAPITester:
    def __init__(self, base_url="https://metrics-core-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({
                "test": name,
                "error": details,
                "expected_status": expected_status,
                "actual_status": actual_status
            })
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(
                    name, 
                    False, 
                    f"Expected {expected_status}, got {response.status_code}: {response.text[:200]}", 
                    expected_status, 
                    response.status_code
                )
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root API endpoint
        success, response = self.run_test(
            "API Root Health Check",
            "GET",
            "",
            200
        )
        
        # Test health endpoint
        success, response = self.run_test(
            "Health Check Endpoint",
            "GET",
            "health",
            200
        )

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication...")
        
        # Test login with valid credentials
        login_data = {
            "email": "admin@mikon.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Login with Valid Credentials",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'data' in response and 'token' in response['data']:
            self.token = response['data']['token']
            self.user_id = response['data']['user']['id']
            print(f"   🔑 Token acquired for user: {response['data']['user']['username']}")
        else:
            print("   ❌ Failed to get authentication token")
            return False
        
        # Test login with invalid credentials
        invalid_login = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        
        self.run_test(
            "Login with Invalid Credentials",
            "POST",
            "auth/login",
            401,
            data=invalid_login
        )
        
        # Test get current user
        if self.token:
            self.run_test(
                "Get Current User Profile",
                "GET",
                "auth/me",
                200
            )
        
        return True

    def test_analytics_dashboard(self):
        """Test analytics dashboard endpoint"""
        print("\n🔍 Testing Analytics Dashboard...")
        
        if not self.token:
            self.log_test("Analytics Dashboard", False, "No authentication token available")
            return
        
        success, response = self.run_test(
            "Dashboard Analytics Data",
            "GET",
            "analytics/dashboard",
            200
        )
        
        if success and 'data' in response:
            data = response['data']
            # Verify expected structure
            expected_keys = ['kpis', 'projectStats', 'revenueByMonth', 'expensesByCategory']
            missing_keys = [key for key in expected_keys if key not in data]
            
            if missing_keys:
                self.log_test(
                    "Dashboard Data Structure",
                    False,
                    f"Missing keys: {missing_keys}"
                )
            else:
                self.log_test("Dashboard Data Structure", True)
                
                # Check KPIs structure
                kpis = data.get('kpis', {})
                expected_kpi_keys = ['totalRevenue', 'scalableRevenue', 'monthlyExpenses', 'independenceScore']
                missing_kpi_keys = [key for key in expected_kpi_keys if key not in kpis]
                
                if missing_kpi_keys:
                    self.log_test(
                        "KPIs Data Structure",
                        False,
                        f"Missing KPI keys: {missing_kpi_keys}"
                    )
                else:
                    self.log_test("KPIs Data Structure", True)

    def test_roi_simulator(self):
        """Test ROI simulator endpoint"""
        print("\n🔍 Testing ROI Simulator...")
        
        if not self.token:
            self.log_test("ROI Simulator", False, "No authentication token available")
            return
        
        simulator_data = {
            "estimatedHours": 100,
            "hourlyRate": 75,
            "modulesUsed": 2,
            "modulesSavings": 0.2,
            "complexityModifier": 1.2
        }
        
        success, response = self.run_test(
            "ROI Simulator Calculation",
            "POST",
            "analytics/roi-simulator",
            200,
            data=simulator_data
        )
        
        if success and 'data' in response:
            data = response['data']
            expected_keys = ['baseRevenue', 'moduleSavings', 'effectiveHours', 'projectedMargin', 'roi', 'efficiencyScore']
            missing_keys = [key for key in expected_keys if key not in data]
            
            if missing_keys:
                self.log_test(
                    "ROI Simulator Response Structure",
                    False,
                    f"Missing keys: {missing_keys}"
                )
            else:
                self.log_test("ROI Simulator Response Structure", True)

    def test_projects_endpoints(self):
        """Test projects CRUD operations"""
        print("\n🔍 Testing Projects Endpoints...")
        
        if not self.token:
            self.log_test("Projects Endpoints", False, "No authentication token available")
            return
        
        # Test get all projects
        success, response = self.run_test(
            "Get All Projects",
            "GET",
            "projects",
            200
        )
        
        # Test create project
        new_project = {
            "name": "Test Project API",
            "client": "Test Client",
            "category": "Puntual",
            "totalBudget": 5000,
            "estimatedHours": 50,
            "status": "Lead"
        }
        
        success, response = self.run_test(
            "Create New Project",
            "POST",
            "projects",
            201,
            data=new_project
        )
        
        project_id = None
        if success and 'data' in response:
            project_id = response['data'].get('_id')
            if project_id:
                print(f"   📝 Created project with ID: {project_id}")
        
        # Test get single project (if we have an ID)
        if project_id:
            self.run_test(
                "Get Single Project",
                "GET",
                f"projects/{project_id}",
                200
            )
            
            # Test update project
            update_data = {
                "name": "Updated Test Project",
                "status": "In Progress"
            }
            
            self.run_test(
                "Update Project",
                "PUT",
                f"projects/{project_id}",
                200,
                data=update_data
            )

    def test_expenses_endpoints(self):
        """Test expenses endpoints"""
        print("\n🔍 Testing Expenses Endpoints...")
        
        if not self.token:
            self.log_test("Expenses Endpoints", False, "No authentication token available")
            return
        
        # Test get all expenses
        self.run_test(
            "Get All Expenses",
            "GET",
            "expenses",
            200
        )

    def test_services_endpoints(self):
        """Test services endpoints"""
        print("\n🔍 Testing Services Endpoints...")
        
        if not self.token:
            self.log_test("Services Endpoints", False, "No authentication token available")
            return
        
        # Test get all services
        self.run_test(
            "Get All Services",
            "GET",
            "services",
            200
        )

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Mikon OSS Backend API Tests")
        print(f"   Base URL: {self.base_url}")
        print(f"   Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run test suites
        self.test_health_endpoints()
        
        auth_success = self.test_authentication()
        if auth_success:
            self.test_analytics_dashboard()
            self.test_roi_simulator()
            self.test_projects_endpoints()
            self.test_expenses_endpoints()
            self.test_services_endpoints()
        else:
            print("\n❌ Authentication failed - skipping authenticated endpoints")
        
        # Print summary
        print(f"\n📊 Test Results Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {len(self.failed_tests)}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = MikonOSSAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_tests": tester.tests_run,
            "passed": tester.tests_passed,
            "failed": len(tester.failed_tests),
            "success_rate": round((tester.tests_passed/tester.tests_run*100), 1) if tester.tests_run > 0 else 0
        },
        "failed_tests": tester.failed_tests,
        "all_results": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: /app/backend_test_results.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())