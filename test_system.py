#!/usr/bin/env python3
"""Test script for Phishing Guardian system."""

import requests
import json
import time

API_BASE = "http://localhost:5000/api"

def test_health():
    """Test health endpoint."""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_classification():
    """Test email classification."""
    print("\n🔍 Testing email classification...")
    
    test_emails = [
        {
            "name": "Phishing Email",
            "data": {
                "subject": "URGENT: Verify your account now!",
                "sender": "security@fake-bank.com",
                "body": "Your account will be suspended unless you click here immediately to verify your identity. Act now!"
            }
        },
        {
            "name": "Safe Email",
            "data": {
                "subject": "Weekly Newsletter",
                "sender": "newsletter@company.com",
                "body": "Here's your weekly update with the latest news and updates from our team."
            }
        }
    ]
    
    for test in test_emails:
        try:
            response = requests.post(
                f"{API_BASE}/classify",
                headers={"Content-Type": "application/json"},
                json=test["data"]
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {test['name']}: {response.status_code}")
                print(f"   Is Phishing: {result['is_phishing']}")
                print(f"   Confidence: {result['confidence']:.2f}")
                print(f"   Risk Factors: {len(result['risk_factors'])}")
            else:
                print(f"❌ {test['name']}: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ {test['name']} failed: {e}")

def test_chatbot():
    """Test security chatbot."""
    print("\n🔍 Testing security chatbot...")
    
    test_messages = [
        "How can I identify phishing emails?",
        "What is the weather today?",  # Should be rejected
        "Tell me about password security"
    ]
    
    for message in test_messages:
        try:
            response = requests.post(
                f"{API_BASE}/chat",
                headers={"Content-Type": "application/json"},
                json={
                    "message": message,
                    "session_id": "test-session"
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Message: '{message[:30]}...'")
                print(f"   Security Related: {result['is_security_related']}")
                print(f"   Response: {result['response'][:100]}...")
            else:
                print(f"❌ Message failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Chatbot test failed: {e}")

def test_report():
    """Test email reporting."""
    print("\n🔍 Testing email reporting...")
    
    try:
        response = requests.post(
            f"{API_BASE}/report",
            headers={"Content-Type": "application/json"},
            json={
                "subject": "Test phishing email",
                "sender": "test@phishing.com",
                "body": "This is a test report"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Report: {response.status_code}")
            print(f"   Status: {result['status']}")
            print(f"   Report ID: {result['report_id']}")
        else:
            print(f"❌ Report failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Report test failed: {e}")

def main():
    """Run all tests."""
    print("🛡️  Phishing Guardian System Test")
    print("=" * 40)
    
    # Test if backend is running
    if not test_health():
        print("\n❌ Backend not running. Start with:")
        print("   cd backend && python run.py")
        return
    
    # Run tests
    test_classification()
    test_chatbot()
    test_report()
    
    print("\n🎉 Testing complete!")
    print("\nNext steps:")
    print("1. Load extension in Chrome: chrome://extensions/")
    print("2. Go to Gmail/Outlook to test email detection")
    print("3. Click shield icon (🛡️) to test chatbot")

if __name__ == "__main__":
    main()